import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CsvParser } from './parsers/csv.parser.js';
import { OfxParser } from './parsers/ofx.parser.js';
import type { CsvColumnMapping, ParseResult } from './parsers/parser.types.js';
import type { ListImportsQuery } from './dto/list-imports.query.js';

const BATCH_SELECT = {
  id: true,
  fileName: true,
  format: true,
  totalRows: true,
  importedCount: true,
  duplicateCount: true,
  createdAt: true,
  account: { select: { id: true, name: true } },
} as const;

interface ImportFileInput {
  accountId: string;
  fileName: string;
  format: 'CSV' | 'OFX';
  buffer: Buffer;
  csvMapping?: CsvColumnMapping;
}

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csvParser: CsvParser,
    private readonly ofxParser: OfxParser,
    private readonly notifications: NotificationsService,
  ) {}

  async import(userId: string, input: ImportFileInput) {
    const account = await this.prisma.account.findFirst({
      where: { id: input.accountId, userId },
      select: { id: true, archivedAt: true },
    });
    if (!account) throw new NotFoundException('Conta não encontrada');
    if (account.archivedAt) {
      throw new BadRequestException('Conta está arquivada');
    }

    let parsed: ParseResult;
    try {
      parsed =
        input.format === 'CSV'
          ? this.csvParser.parse(input.buffer, input.csvMapping)
          : this.ofxParser.parse(input.buffer);
    } catch (err) {
      throw new BadRequestException(
        `Falha ao processar arquivo: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (parsed.transactions.length === 0) {
      throw new BadRequestException(
        'Nenhuma transação válida no arquivo. Verifique o formato e o mapeamento de colunas.',
      );
    }

    const batch = await this.prisma.importBatch.create({
      data: {
        userId,
        accountId: input.accountId,
        fileName: input.fileName,
        format: input.format,
        totalRows: parsed.transactions.length + parsed.errors.length,
        importedCount: 0,
        duplicateCount: 0,
      },
      select: { id: true },
    });

    const result = await this.persistTransactions(
      userId,
      input.accountId,
      batch.id,
      parsed.transactions,
    );

    await this.prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        importedCount: result.imported,
        duplicateCount: result.duplicates,
      },
    });

    void this.notifications
      .create({
        userId,
        type: 'IMPORT_FINISHED',
        title: `Importação concluída: ${input.fileName}`,
        body: `${result.imported} importadas, ${result.duplicates} duplicadas${parsed.errors.length > 0 ? `, ${parsed.errors.length} com erro` : ''}.`,
        data: {
          importBatchId: batch.id,
          imported: result.imported,
          duplicates: result.duplicates,
          errors: parsed.errors.length,
        },
      })
      .catch((err) =>
        this.logger.error(
          `Falha ao notificar import ${batch.id}`,
          err instanceof Error ? err.stack : String(err),
        ),
      );

    return {
      importBatchId: batch.id,
      totalRows: parsed.transactions.length + parsed.errors.length,
      imported: result.imported,
      duplicates: result.duplicates,
      errors: parsed.errors,
    };
  }

  private async persistTransactions(
    userId: string,
    accountId: string,
    batchId: string,
    transactions: ParseResult['transactions'],
  ): Promise<{ imported: number; duplicates: number }> {
    const externalIds = transactions.map((t) => t.externalId);

    const existing = await this.prisma.transaction.findMany({
      where: {
        accountId,
        externalId: { in: externalIds },
      },
      select: { externalId: true },
    });
    const existingSet = new Set(existing.map((e) => e.externalId));

    const toInsert = transactions.filter((t) => !existingSet.has(t.externalId));
    const duplicateCount = transactions.length - toInsert.length;

    if (toInsert.length === 0) {
      return { imported: 0, duplicates: duplicateCount };
    }

    const result = await this.prisma.transaction.createMany({
      data: toInsert.map((t) => ({
        userId,
        accountId,
        importBatchId: batchId,
        externalId: t.externalId,
        type: t.type,
        amount: new Prisma.Decimal(t.amount),
        description: t.description,
        date: t.date,
        isPaid: true,
      })),
      skipDuplicates: true,
    });

    return {
      imported: result.count,
      duplicates: duplicateCount + (toInsert.length - result.count),
    };
  }

  async list(userId: string, query: ListImportsQuery) {
    const where: Prisma.ImportBatchWhereInput = {
      userId,
      ...(query.accountId ? { accountId: query.accountId } : {}),
      ...(query.format ? { format: query.format } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.importBatch.findMany({
        where,
        select: BATCH_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      this.prisma.importBatch.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPages: Math.ceil(total / query.perPage),
      },
    };
  }

  async findOne(userId: string, importId: string) {
    const batch = await this.prisma.importBatch.findFirst({
      where: { id: importId, userId },
      select: {
        ...BATCH_SELECT,
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            date: true,
            isPaid: true,
            accountId: true,
            categoryId: true,
            tags: { select: { tag: { select: { id: true, name: true } } } },
          },
          orderBy: { date: 'asc' },
        },
      },
    });
    if (!batch) throw new NotFoundException('Importação não encontrada');
    return batch;
  }

  async remove(userId: string, importId: string) {
    const batch = await this.prisma.importBatch.findFirst({
      where: { id: importId, userId },
      select: { id: true, _count: { select: { transactions: true } } },
    });
    if (!batch) throw new NotFoundException('Importação não encontrada');

    await this.prisma.$transaction([
      this.prisma.transaction.deleteMany({
        where: { importBatchId: importId },
      }),
      this.prisma.importBatch.delete({ where: { id: importId } }),
    ]);

    return {
      message: 'Importação revertida',
      deletedTransactions: batch._count.transactions,
    };
  }
}
