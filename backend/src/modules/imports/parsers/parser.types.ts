export interface ParsedTransaction {
  date: Date;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  externalId: string;
  sourceLine: number;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  errors: Array<{ line: number; reason: string }>;
}

export interface CsvColumnMapping {
  date: string;
  amount: string;
  description: string;
  type?: string;
}
