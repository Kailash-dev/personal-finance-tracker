import { PrismaClient } from '@prisma/client';
import pdfParse from 'pdf-parse';
import { getParserForBank } from '../parsers';
import { categorizeTransaction, checkDuplicateTransaction } from '@personal-finance/shared';

const prisma = new PrismaClient();

export class ImportService {
  async processPdfBuffer(
    userId: string,
    accountId: string,
    fileName: string,
    buffer: Buffer,
    bankHint?: string
  ) {
    // 1. Extract text from PDF
    let pdfText = '';
    try {
      const data = await pdfParse(buffer);
      pdfText = data.text;
    } catch (e: any) {
      throw new Error(`Failed to read PDF document: ${e.message}`);
    }

    // 2. Select appropriate parser
    const parser = getParserForBank(pdfText, bankHint);
    const parseResult = await parser.parse(pdfText);

    if (parseResult.isScanned || parseResult.transactions.length === 0) {
      return {
        isScanned: true,
        message: 'This PDF appears to be scanned or image-based. OCR is required to extract transactions from image scans.',
        transactions: [],
      };
    }

    // 3. Fetch user custom rules and existing transactions for duplicate detection
    const [customRules, existingTxns] = await Promise.all([
      prisma.merchantRule.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId, accountId },
        orderBy: { date: 'desc' },
        take: 300,
      }),
    ]);

    // 4. Create BankImport record in PENDING_REVIEW state
    const bankImport = await prisma.bankImport.create({
      data: {
        userId,
        accountId,
        fileName,
        bankName: parseResult.bankName,
        periodStart: parseResult.periodStart,
        periodEnd: parseResult.periodEnd,
        totalParsed: parseResult.transactions.length,
        status: 'PENDING_REVIEW',
      },
    });

    // 5. Categorize and detect duplicates for each extracted transaction
    let categorizedCount = 0;
    const importTxnsToCreate = [];

    for (const rawTx of parseResult.transactions) {
      const catRes = categorizeTransaction(rawTx.description, rawTx.amount, customRules as any);
      if (catRes.confidence >= 0.7) {
        categorizedCount++;
      }

      const dupRes = checkDuplicateTransaction(
        {
          date: rawTx.date,
          amount: rawTx.amount,
          description: rawTx.description,
          referenceNumber: rawTx.referenceNumber,
          accountId,
        },
        existingTxns as any
      );

      importTxnsToCreate.push({
        importId: bankImport.id,
        date: rawTx.date,
        description: rawTx.description,
        referenceNumber: rawTx.referenceNumber,
        amount: rawTx.amount,
        type: catRes.type || rawTx.type,
        paymentMethod: rawTx.paymentMethod,
        balanceAfter: rawTx.balanceAfter,
        categoryId: catRes.categoryId,
        subcategoryId: catRes.subcategoryId,
        confidence: catRes.confidence,
        isDuplicate: dupRes.isDuplicate,
        duplicateReason: dupRes.reason,
        isSkipped: dupRes.isDuplicate, // Default to skipping duplicates
        rawText: rawTx.rawText,
      });
    }

    await prisma.bankImportTransaction.createMany({
      data: importTxnsToCreate,
    });

    await prisma.bankImport.update({
      where: { id: bankImport.id },
      data: { totalCategorized: categorizedCount },
    });

    return prisma.bankImport.findUnique({
      where: { id: bankImport.id },
      include: {
        transactions: true,
        account: true,
      },
    });
  }

  async getImportDetails(id: string, userId: string) {
    return prisma.bankImport.findUnique({
      where: { id, userId },
      include: {
        transactions: true,
        account: true,
      },
    });
  }

  async confirmImport(
    importId: string,
    userId: string,
    confirmedTransactions: {
      id: string;
      categoryId: string;
      subcategoryId?: string;
      type: string;
      isSkipped: boolean;
    }[]
  ) {
    const bankImport = await prisma.bankImport.findUnique({
      where: { id: importId, userId },
      include: { transactions: true },
    });

    if (!bankImport) throw new Error('Import not found');
    if (bankImport.status === 'CONFIRMED') throw new Error('Import has already been confirmed');

    const txMap = new Map(confirmedTransactions.map((t) => [t.id, t]));
    const transactionsToInsert = [];
    let netBalanceAdjustment = 0;

    for (const rawTx of bankImport.transactions) {
      const updateInfo = txMap.get(rawTx.id);
      const isSkipped = updateInfo ? updateInfo.isSkipped : rawTx.isSkipped;

      if (!isSkipped) {
        const categoryId = updateInfo?.categoryId || rawTx.categoryId || 'cat_misc';
        const subcategoryId = updateInfo?.subcategoryId || rawTx.subcategoryId;
        const type = updateInfo?.type || rawTx.type;

        transactionsToInsert.push({
          userId,
          accountId: bankImport.accountId,
          categoryId,
          subcategoryId,
          date: rawTx.date,
          description: rawTx.description,
          amount: rawTx.amount,
          type,
          paymentMethod: rawTx.paymentMethod,
          source: 'BANK_PDF',
          referenceNumber: rawTx.referenceNumber,
          balanceAfter: rawTx.balanceAfter,
          importId: bankImport.id,
        });

        netBalanceAdjustment += rawTx.amount;
      }
    }

    if (transactionsToInsert.length > 0) {
      await prisma.transaction.createMany({
        data: transactionsToInsert,
      });

      await prisma.account.update({
        where: { id: bankImport.accountId },
        data: {
          currentBalance: { increment: netBalanceAdjustment },
        },
      });
    }

    await prisma.bankImport.update({
      where: { id: importId },
      data: { status: 'CONFIRMED' },
    });

    return {
      success: true,
      importedCount: transactionsToInsert.length,
    };
  }
}
