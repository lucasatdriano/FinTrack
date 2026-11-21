import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { createHash } from 'node:crypto';
import type { FileParser } from './parser.interface.js';
import type {
  CsvColumnMapping,
  ParsedTransaction,
  ParseResult,
} from './parser.types.js';

@Injectable()
export class CsvParser implements FileParser {
  parse(buffer: Buffer, options?: unknown): ParseResult {
    const mapping = options as CsvColumnMapping;
    if (!mapping?.date || !mapping?.amount || !mapping?.description) {
      throw new BadRequestException(
        'CSV exige mapping com date, amount e description.',
      );
    }

    const rawRows = this.readRows(buffer);

    if (rawRows.length === 0) {
      return { transactions: [], errors: [] };
    }

    const header = rawRows[0];
    const requiredCols = [mapping.date, mapping.amount, mapping.description];
    for (const col of requiredCols) {
      if (!header.includes(col)) {
        throw new BadRequestException(
          `Coluna "${col}" não encontrada no CSV. Colunas disponíveis: ${header.join(', ')}`,
        );
      }
    }

    const transactions: ParsedTransaction[] = [];
    const errors: ParseResult['errors'] = [];

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      const lineNumber = i + 1;

      try {
        const parsed = this.parseRow(row, header, mapping, lineNumber);
        transactions.push(parsed);
      } catch (err) {
        errors.push({
          line: lineNumber,
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { transactions, errors };
  }

  private readRows(buffer: Buffer): string[][] {
    let content: string;
    try {
      content = buffer.toString('utf-8');
      if ((content.match(/\uFFFD/g) || []).length > content.length * 0.01) {
        content = buffer.toString('latin1');
      }
    } catch {
      content = buffer.toString('latin1');
    }

    content = content.replace(/^\uFEFF/, '');

    const firstLine = content.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    return parse(content, {
      delimiter,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    }) as string[][];
  }

  private parseRow(
    row: string[],
    header: string[],
    mapping: CsvColumnMapping,
    lineNumber: number,
  ): ParsedTransaction {
    const get = (col: string): string => {
      const idx = header.indexOf(col);
      if (idx === -1) throw new Error(`Coluna "${col}" não encontrada`);
      return (row[idx] ?? '').trim();
    };

    const dateRaw = get(mapping.date);
    const amountRaw = get(mapping.amount);
    const description = get(mapping.description);

    if (!description) throw new Error('Descrição vazia');

    const date = this.parseDate(dateRaw);
    const { amount, type } = this.parseAmount(
      amountRaw,
      mapping.type ? get(mapping.type) : undefined,
    );

    const externalId = createHash('sha256')
      .update(
        [
          date.toISOString().slice(0, 10),
          amount,
          type,
          description,
          lineNumber,
        ].join('|'),
      )
      .digest('hex')
      .slice(0, 32);

    return {
      date,
      amount,
      type,
      description: description.slice(0, 120),
      externalId,
      sourceLine: lineNumber,
    };
  }

  private parseDate(raw: string): Date {
    if (!raw) throw new Error('Data vazia');

    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
    if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00Z`);

    const br = /^(\d{2})[/-](\d{2})[/-](\d{4})/.exec(raw);
    if (br) return new Date(`${br[3]}-${br[2]}-${br[1]}T00:00:00Z`);

    throw new Error(`Data inválida: "${raw}"`);
  }

  private parseAmount(
    raw: string,
    typeCol?: string,
  ): { amount: number; type: 'INCOME' | 'EXPENSE' } {
    if (!raw) throw new Error('Valor vazio');

    let clean = raw
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const isNegative = clean.startsWith('-');
    clean = clean.replace(/^-/, '');

    const amount = Number(clean);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Valor inválido: "${raw}"`);
    }

    if (typeCol) {
      const t = typeCol.toLowerCase();
      if (t.includes('débito') || t.includes('debito') || t.includes('d')) {
        return { amount: Math.round(amount * 100) / 100, type: 'EXPENSE' };
      }
      if (t.includes('crédito') || t.includes('credito') || t.includes('c')) {
        return { amount: Math.round(amount * 100) / 100, type: 'INCOME' };
      }
    }

    return {
      amount: Math.round(amount * 100) / 100,
      type: isNegative ? 'EXPENSE' : 'INCOME',
    };
  }
}
