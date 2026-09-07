import { BankStatementParser } from './BankStatementParser';
import { GenericParser } from './GenericParser';
import { HDFCParser } from './HDFCParser';
import { SBIParser, ICICIParser } from './SBIParser';

export * from './BankStatementParser';
export * from './GenericParser';
export * from './HDFCParser';
export * from './SBIParser';

const parsers: BankStatementParser[] = [
  new HDFCParser(),
  new SBIParser(),
  new ICICIParser(),
  new GenericParser(), // Fallback
];

export function getParserForBank(text: string, bankHint?: string): BankStatementParser {
  for (const parser of parsers) {
    if (parser.canHandle(text, bankHint)) {
      return parser;
    }
  }
  return new GenericParser();
}
