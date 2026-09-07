import { BankStatementParser, BankStatementParseResult, ParsedRawTransaction } from './BankStatementParser';
import { parseINR } from '@personal-finance/shared';
import { PaymentMethod, TransactionType } from '@personal-finance/types';

/**
 * Generic Bank Statement Parser
 * Handles common Indian statement formats with DD/MM/YYYY or DD-MM-YYYY dates
 */
export class GenericParser implements BankStatementParser {
  name = 'Generic Indian Bank Parser';

  canHandle(_text: string, _bankHint?: string): boolean {
    return true; // Fallback parser
  }

  async parse(text: string): Promise<BankStatementParseResult> {
    if (!text || text.trim().length < 50) {
      return {
        bankName: 'Unknown',
        transactions: [],
        isScanned: true,
        notes: 'The statement document appears to be scanned or contains no extractable text. OCR is required.',
      };
    }

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const transactions: ParsedRawTransaction[] = [];

    // Date regex matching DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY, DD-MMM-YYYY
    const dateRegex = /\b(\d{1,2}[/-](?:\d{1,2}|[A-Za-z]{3})[/-]\d{2,4})\b/;

    // Amount regex matching amounts with Indian commas e.g. 1,250.00 or 50,000.00
    const amountRegex = /\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?\b/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const dateMatch = line.match(dateRegex);

      if (dateMatch) {
        const dateStr = this.normalizeDate(dateMatch[1]);
        if (!dateStr) continue;

        // Find amounts on this line
        const numbers = line.match(amountRegex);
        if (!numbers || numbers.length === 0) continue;

        // Determine if line has Credit / CR or Debit / DR indicators
        const isCredit = /\b(?:CR|CREDIT|DEPOSIT|CR\.)\b/i.test(line) && !/\b(?:DR|DEBIT|WITHDRAWAL)\b/i.test(line);
        const isDebit = /\b(?:DR|DEBIT|WITHDRAWAL|PAYMENT)\b/i.test(line);

        // Usually last number is balance, second-last is transaction amount
        let amount = 0;
        let balanceAfter: number | undefined;

        if (numbers.length >= 2) {
          balanceAfter = parseINR(numbers[numbers.length - 1]);
          amount = parseINR(numbers[numbers.length - 2]);
        } else {
          amount = parseINR(numbers[0]);
        }

        if (amount <= 0) continue;

        // Extract description by removing date and numbers
        let desc = line
          .replace(dateMatch[0], '')
          .replace(amountRegex, '')
          .replace(/\b(?:CR|DR|DEPOSIT|WITHDRAWAL|TRANSFER)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (!desc || desc.length < 3) {
          desc = lines[i + 1] ? lines[i + 1].slice(0, 50) : 'Transaction';
        }

        // Determine payment method and type
        const paymentMethod = this.deducePaymentMethod(desc);
        const type: TransactionType = isCredit ? 'INCOME' : 'EXPENSE';
        const finalAmount = isCredit ? Math.abs(amount) : -Math.abs(amount);

        // Extract reference number if present
        const refMatch = line.match(/\b(?:\d{10,14}|[A-Z0-9]{12})\b/);
        const referenceNumber = refMatch ? refMatch[0] : undefined;

        transactions.push({
          date: dateStr,
          description: desc,
          referenceNumber,
          amount: finalAmount,
          type,
          paymentMethod,
          balanceAfter,
          rawText: line,
        });
      }
    }

    // Sort by date ascending
    transactions.sort((a, b) => a.date.localeCompare(b.date));

    return {
      bankName: 'Bank Account',
      transactions,
      isScanned: transactions.length === 0,
      periodStart: transactions.length > 0 ? transactions[0].date : undefined,
      periodEnd: transactions.length > 0 ? transactions[transactions.length - 1].date : undefined,
      notes: transactions.length === 0 ? 'No transactions detected. OCR might be needed for scanned statements.' : undefined,
    };
  }

  private normalizeDate(dateStr: string): string | null {
    try {
      const parts = dateStr.replace(/-/g, '/').split('/');
      if (parts.length !== 3) return null;

      let day = parseInt(parts[0], 10);
      let monthStr = parts[1];
      let year = parseInt(parts[2], 10);

      if (year < 100) year += 2000;

      let month = 0;
      if (isNaN(parseInt(monthStr, 10))) {
        const months: Record<string, number> = {
          jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
          jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
        };
        month = months[monthStr.toLowerCase().slice(0, 3)] || 1;
      } else {
        month = parseInt(monthStr, 10);
      }

      if (day > 31 || month > 12 || isNaN(day) || isNaN(month) || isNaN(year)) return null;

      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } catch {
      return null;
    }
  }

  private deducePaymentMethod(desc: string): PaymentMethod {
    const d = desc.toUpperCase();
    if (d.includes('UPI')) return 'UPI';
    if (d.includes('POS') || d.includes('CARD') || d.includes('ECOM')) return 'DEBIT_CARD';
    if (d.includes('NEFT')) return 'NEFT';
    if (d.includes('IMPS')) return 'IMPS';
    if (d.includes('RTGS')) return 'RTGS';
    if (d.includes('ACH') || d.includes('NACH') || d.includes('AUTO DEBIT')) return 'AUTO_DEBIT';
    if (d.includes('ATM') || d.includes('CASH WDL')) return 'CASH';
    if (d.includes('CHQ') || d.includes('CHEQUE')) return 'CHEQUE';
    return 'NET_BANKING';
  }
}
