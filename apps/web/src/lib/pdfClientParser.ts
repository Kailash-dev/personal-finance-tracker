import * as pdfjsLib from 'pdfjs-dist';
import { categorizeTransaction, checkDuplicateTransaction } from '@personal-finance/shared';
import { BankImportTransaction, BankName } from '@personal-finance/types';
import { storageService } from '../services/storageService';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ClientParsedStatementResult {
  fileName: string;
  bankName: string;
  periodStart?: string;
  periodEnd?: string;
  totalParsed: number;
  totalCategorized: number;
  transactions: BankImportTransaction[];
  isScanned: boolean;
  notes?: string;
}

/**
 * Parses Bank Statement PDF directly in the browser
 */
export async function parsePdfInBrowser(
  file: File,
  accountId: string,
  bankHint?: BankName | string
): Promise<ClientParsedStatementResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }

  if (!fullText || fullText.trim().length < 50) {
    return {
      fileName: file.name,
      bankName: bankHint || 'Unknown Bank',
      totalParsed: 0,
      totalCategorized: 0,
      transactions: [],
      isScanned: true,
      notes: 'This PDF appears to be scanned. OCR is required to extract text.',
    };
  }

  // Parse transactions line-by-line
  const lines = fullText.split('\n').join(' ').split(/(?=\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b)/);
  const parsedTxns: BankImportTransaction[] = [];
  const existingTxns = storageService.getTransactions({ accountId });
  const rules = storageService.getRules();

  const dateRegex = /\b(\d{1,2}[/-](?:\d{1,2}|[A-Za-z]{3})[/-]\d{2,4})\b/;
  const amountRegex = /\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})\b/g;

  let autoCategorizedCount = 0;

  for (let idx = 0; idx < lines.length; idx++) {
    const block = lines[idx].trim();
    if (!block) continue;

    const dateMatch = block.match(dateRegex);
    if (!dateMatch) continue;

    const normalizedDate = normalizeDate(dateMatch[1]);
    if (!normalizedDate) continue;

    const numbers = block.match(amountRegex);
    if (!numbers || numbers.length === 0) continue;

    const isCredit = /\b(?:CR|CREDIT|DEPOSIT|SALARY)\b/i.test(block) && !/\b(?:DR|DEBIT|WITHDRAWAL)\b/i.test(block);
    let amountNum = 0;
    let balanceNum: number | undefined;

    if (numbers.length >= 2) {
      balanceNum = parseFloat(numbers[numbers.length - 1].replace(/,/g, ''));
      amountNum = parseFloat(numbers[numbers.length - 2].replace(/,/g, ''));
    } else {
      amountNum = parseFloat(numbers[0].replace(/,/g, ''));
    }

    if (isNaN(amountNum) || amountNum <= 0) continue;

    const finalAmount = isCredit ? amountNum : -amountNum;

    // Clean description
    let desc = block
      .replace(dateMatch[0], '')
      .replace(amountRegex, '')
      .replace(/\b(?:CR|DR|DEPOSIT|WITHDRAWAL|TRANSFER|UPI|REF|IMPS|NEFT)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (desc.length < 3) desc = 'Bank Transaction';

    // Auto-categorize
    const catRes = categorizeTransaction(block, finalAmount, rules as any);
    if (catRes.confidence >= 0.7) autoCategorizedCount++;

    // Duplicate detection
    const dupRes = checkDuplicateTransaction(
      {
        date: normalizedDate,
        amount: finalAmount,
        description: desc,
        accountId,
      },
      existingTxns
    );

    parsedTxns.push({
      id: `import_tx_${idx}_${Date.now()}`,
      importId: `import_${Date.now()}`,
      date: normalizedDate,
      description: desc.slice(0, 60),
      amount: finalAmount,
      type: catRes.type,
      paymentMethod: catRes.type === 'INCOME' ? 'NEFT' : 'UPI',
      balanceAfter: balanceNum,
      categoryId: catRes.categoryId,
      subcategoryId: catRes.subcategoryId,
      confidence: catRes.confidence,
      isDuplicate: dupRes.isDuplicate,
      duplicateReason: dupRes.reason,
      isSkipped: dupRes.isDuplicate,
      rawText: block.slice(0, 100),
    });
  }

  // Sort ascending
  parsedTxns.sort((a, b) => a.date.localeCompare(b.date));

  return {
    fileName: file.name,
    bankName: bankHint || 'Bank Statement',
    periodStart: parsedTxns.length > 0 ? parsedTxns[0].date : undefined,
    periodEnd: parsedTxns.length > 0 ? parsedTxns[parsedTxns.length - 1].date : undefined,
    totalParsed: parsedTxns.length,
    totalCategorized: autoCategorizedCount,
    transactions: parsedTxns,
    isScanned: parsedTxns.length === 0,
    notes: parsedTxns.length === 0 ? 'No transactions extracted. If scanned, OCR is required.' : undefined,
  };
}

function normalizeDate(dateStr: string): string | null {
  try {
    const parts = dateStr.replace(/-/g, '/').split('/');
    if (parts.length !== 3) return null;

    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    if (year < 100) year += 2000;
    if (day > 31 || month > 12 || isNaN(day) || isNaN(month) || isNaN(year)) return null;

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } catch {
    return null;
  }
}
