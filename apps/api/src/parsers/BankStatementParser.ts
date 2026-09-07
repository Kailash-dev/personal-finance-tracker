import { PaymentMethod, TransactionType } from '@personal-finance/types';

export interface ParsedRawTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  referenceNumber?: string;
  amount: number; // positive for credit/income, negative for debit/expense
  type: TransactionType;
  paymentMethod: PaymentMethod;
  balanceAfter?: number;
  rawText: string;
}

export interface BankStatementParseResult {
  bankName: string;
  accountNumberMasked?: string;
  periodStart?: string;
  periodEnd?: string;
  transactions: ParsedRawTransaction[];
  isScanned: boolean;
  notes?: string;
}

export interface BankStatementParser {
  name: string;
  canHandle(text: string, bankHint?: string): boolean;
  parse(text: string): Promise<BankStatementParseResult>;
}
