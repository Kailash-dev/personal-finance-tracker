import { BankStatementParser, BankStatementParseResult, ParsedRawTransaction } from './BankStatementParser';
import { parseINR } from '@personal-finance/shared';
import { PaymentMethod, TransactionType } from '@personal-finance/types';

/**
 * HDFC Bank Statement Parser
 * Typical format: Date, Narration, Chq/Ref No, Value Dt, Withdrawal Amt, Deposit Amt, Closing Balance
 */
export class HDFCParser implements BankStatementParser {
  name = 'HDFC Bank Statement Parser';

  canHandle(text: string, bankHint?: string): boolean {
    if (bankHint === 'HDFC') return true;
    return text.includes('HDFC BANK') || text.includes('www.hdfcbank.com');
  }

  async parse(text: string): Promise<BankStatementParseResult> {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const transactions: ParsedRawTransaction[] = [];
    let accountNumberMasked: string | undefined;

    // Look for account number
    const accMatch = text.match(/Account\s*(?:No|Number)\s*[:.]?\s*(\d{8,16})/i);
    if (accMatch) {
      const num = accMatch[1];
      accountNumberMasked = `HDFC ****${num.slice(-4)}`;
    }

    // Pattern: DD/MM/YY or DD/MM/YYYY Narration RefNo ...
    const dateRegex = /^(\d{2}\/\d{2}\/(?:\d{2}|\d{4}))/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(dateRegex);

      if (match) {
        const rawDate = match[1];
        const date = this.formatDate(rawDate);
        if (!date) continue;

        // Amounts in HDFC statements
        const amountMatches = line.match(/\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})\b/g);
        if (!amountMatches || amountMatches.length === 0) continue;

        const balanceAfter = parseINR(amountMatches[amountMatches.length - 1]);
        const txnAmount = parseINR(amountMatches[amountMatches.length - 2] || amountMatches[0]);

        // Detect if deposit or withdrawal
        const isCredit = line.includes(' CR ') || line.endsWith('CR') || (amountMatches.length >= 3 && line.indexOf(amountMatches[1]) > line.indexOf(amountMatches[0]));
        const amount = isCredit ? Math.abs(txnAmount) : -Math.abs(txnAmount);
        const type: TransactionType = isCredit ? 'INCOME' : 'EXPENSE';

        let desc = line
          .replace(match[0], '')
          .replace(/\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        // Extract reference
        const refMatch = line.match(/\b\d{10,14}\b/);

        transactions.push({
          date,
          description: desc || 'HDFC Transaction',
          referenceNumber: refMatch ? refMatch[0] : undefined,
          amount,
          type,
          paymentMethod: this.getPaymentMethod(desc),
          balanceAfter,
          rawText: line,
        });
      }
    }

    transactions.sort((a, b) => a.date.localeCompare(b.date));

    return {
      bankName: 'HDFC Bank',
      accountNumberMasked,
      transactions,
      isScanned: transactions.length === 0,
      periodStart: transactions.length > 0 ? transactions[0].date : undefined,
      periodEnd: transactions.length > 0 ? transactions[transactions.length - 1].date : undefined,
    };
  }

  private formatDate(d: string): string | null {
    const parts = d.split('/');
    if (parts.length !== 3) return null;
    let [day, month, year] = parts;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private getPaymentMethod(desc: string): PaymentMethod {
    const d = desc.toUpperCase();
    if (d.includes('UPI')) return 'UPI';
    if (d.includes('POS') || d.includes('DEBIT CARD')) return 'DEBIT_CARD';
    if (d.includes('NEFT')) return 'NEFT';
    if (d.includes('IMPS')) return 'IMPS';
    if (d.includes('ACH') || d.includes('NACH') || d.includes('LOAN EMI')) return 'AUTO_DEBIT';
    if (d.includes('ATM') || d.includes('NFS')) return 'CASH';
    return 'NET_BANKING';
  }
}
