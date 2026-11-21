import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { FileParser } from './parser.interface.js';
import type { ParsedTransaction, ParseResult } from './parser.types.js';

@Injectable()
export class OfxParser implements FileParser {
  parse(buffer: Buffer): ParseResult {
    let content = buffer.toString('utf-8');
    if (content.includes('\uFFFD')) {
      content = buffer.toString('latin1');
    }

    content = content.replace(/^\uFEFF/, '').replace(/\r/g, '');

    if (!/<OFX>/i.test(content)) {
      throw new BadRequestException('Arquivo não é um OFX válido.');
    }

    const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    const matches = content.matchAll(trnRegex);

    const transactions: ParsedTransaction[] = [];
    const errors: ParseResult['errors'] = [];
    let lineNumber = 0;

    for (const match of matches) {
      lineNumber++;
      const block = match[1];

      try {
        const trnType = this.extractTag(block, 'TRNTYPE');
        const dtPosted = this.extractTag(block, 'DTPOSTED');
        const trnAmt = this.extractTag(block, 'TRNAMT');
        const fitId = this.extractTag(block, 'FITID');
        const memo =
          this.extractTag(block, 'MEMO') ||
          this.extractTag(block, 'NAME') ||
          '';

        if (!dtPosted || !trnAmt) {
          throw new Error('DTPOSTED ou TRNAMT ausentes');
        }

        const date = this.parseOfxDate(dtPosted);
        const amountRaw = Number(trnAmt.replace(',', '.'));
        if (!Number.isFinite(amountRaw) || amountRaw === 0) {
          throw new Error(`Valor inválido: "${trnAmt}"`);
        }

        const amount = Math.abs(amountRaw);
        const type: 'INCOME' | 'EXPENSE' =
          trnType?.toUpperCase() === 'CREDIT' || amountRaw > 0
            ? 'INCOME'
            : 'EXPENSE';

        const description = (memo || 'Importado').slice(0, 120);

        const externalId = fitId
          ? `ofx:${fitId.slice(0, 32)}`
          : createHash('sha256')
              .update(`${date.toISOString()}|${amount}|${type}|${description}`)
              .digest('hex')
              .slice(0, 32);

        transactions.push({
          date,
          amount,
          type,
          description,
          externalId,
          sourceLine: lineNumber,
        });
      } catch (err) {
        errors.push({
          line: lineNumber,
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (lineNumber === 0) {
      throw new BadRequestException(
        'Nenhuma transação (<STMTTRN>) encontrada no arquivo OFX.',
      );
    }

    return { transactions, errors };
  }

  private extractTag(block: string, tag: string): string | null {
    const xml = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i').exec(block);
    if (xml) return xml[1].trim();

    const sgml = new RegExp(`<${tag}>([^<\\n]*)`, 'i').exec(block);
    if (sgml) return sgml[1].trim();

    return null;
  }

  private parseOfxDate(raw: string): Date {
    const clean = raw.replace(/\[.*$/, '').trim();
    if (clean.length < 8) throw new Error(`Data OFX inválida: "${raw}"`);

    const year = clean.slice(0, 4);
    const month = clean.slice(4, 6);
    const day = clean.slice(6, 8);

    return new Date(`${year}-${month}-${day}T00:00:00Z`);
  }
}
