import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateTransactionDto } from './dto/create-transaction.dto.js';
import type { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import type { ListTransactionsQuery } from './dto/list-transactions.query.js';
import { BudgetAlertsService } from '../budgets/budget-alerts.service.js';

const TX_SELECT = {
  id: true,
  type: true,
  amount: true,
  description: true,
  notes: true,
  date: true,
  isPaid: true,
  accountId: true,
  destinationAccountId: true,
  categoryId: true,
  recurringId: true,
  installmentPlanId: true,
  installmentNumber: true,
  importBatchId: true,
  createdAt: true,
  updatedAt: true,
  account: { select: { id: true, name: true, type: true } },
  destinationAccount: { select: { id: true, name: true, type: true } },
  category: {
    select: { id: true, name: true, type: true, icon: true, color: true },
  },
  tags: { select: { tag: { select: { id: true, name: true } } } },
} as const;

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly budgetAlertsService: BudgetAlertsService,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    this.assertTransferInvariants({
      type: dto.type,
      accountId: dto.accountId,
      destinationAccountId: dto.destinationAccountId ?? null,
      categoryId: dto.categoryId ?? null,
    });

    await this.assertAccountsUsable(this.prisma, userId, [
      dto.accountId,
      ...(dto.destinationAccountId ? [dto.destinationAccountId] : []),
    ]);

    if (dto.categoryId) {
      await this.assertCategoryUsable(
        this.prisma,
        userId,
        dto.categoryId,
        dto.type,
      );
    }

    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.assertTagsBelongToUser(this.prisma, userId, dto.tagIds);
    }

    try {
      const tx = await this.prisma.$transaction(async (tx) => {
        return tx.transaction.create({
          data: {
            userId,
            type: dto.type,
            amount: new Prisma.Decimal(dto.amount),
            description: dto.description,
            notes: dto.notes,
            date: new Date(`${dto.date}T00:00:00Z`),
            isPaid: dto.isPaid,
            accountId: dto.accountId,
            destinationAccountId: dto.destinationAccountId ?? null,
            categoryId: dto.categoryId ?? null,
            ...(dto.tagIds &&
              dto.tagIds.length > 0 && {
                tags: {
                  create: dto.tagIds.map((tagId) => ({ tagId })),
                },
              }),
          },
          select: TX_SELECT,
        });
      });

      void this.budgetAlertsService
        .evaluateForTransaction({ userId, transactionId: tx.id })
        .catch((err) => this.logger.error('Falha ao avaliar budget', err));

      return tx;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'Conta, categoria ou tag foi removida durante a operação. Tente novamente.',
        );
      }
      throw err;
    }
  }

  async list(userId: string, query: ListTransactionsQuery) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.accountId ? { accountId: query.accountId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.isPaid !== undefined ? { isPaid: query.isPaid } : {}),
      ...(query.from || query.to
        ? {
            date: {
              ...(query.from && { gte: new Date(`${query.from}T00:00:00Z`) }),
              ...(query.to && { lte: new Date(`${query.to}T23:59:59.999Z`) }),
            },
          }
        : {}),
      ...(query.search
        ? { description: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        select: TX_SELECT,
        orderBy: { [query.orderBy]: query.order },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      this.prisma.transaction.count({ where }),
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

  async findOne(userId: string, transactionId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      select: TX_SELECT,
    });
    if (!tx) throw new NotFoundException('Transação não encontrada');
    return tx;
  }

  async update(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto,
  ) {
    let finalTxForAlert: {
      id: string;
      date: Date;
      type: string;
      isPaid: boolean;
    } | null = null;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const current = await tx.transaction.findFirst({
          where: { id: transactionId, userId },
          select: {
            id: true,
            type: true,
            accountId: true,
            destinationAccountId: true,
            categoryId: true,
            recurringId: true,
            installmentPlanId: true,
          },
        });
        if (!current) throw new NotFoundException('Transação não encontrada');

        if (current.recurringId || current.installmentPlanId) {
          throw new ConflictException(
            'Transação gerada por recorrência/parcelamento não pode ser editada diretamente',
          );
        }

        const final = {
          type: dto.type ?? current.type,
          accountId: dto.accountId ?? current.accountId,
          destinationAccountId:
            dto.destinationAccountId !== undefined
              ? dto.destinationAccountId
              : current.destinationAccountId,
          categoryId:
            dto.categoryId !== undefined ? dto.categoryId : current.categoryId,
        };

        this.assertTransferInvariants(final);

        const accountIds = [
          final.accountId,
          ...(final.destinationAccountId ? [final.destinationAccountId] : []),
        ];
        await this.assertAccountsUsable(tx, userId, accountIds);

        if (final.categoryId) {
          await this.assertCategoryUsable(
            tx,
            userId,
            final.categoryId,
            final.type,
          );
        }

        if (dto.tagIds && dto.tagIds.length > 0) {
          await this.assertTagsBelongToUser(tx, userId, dto.tagIds);
        }

        const updated = await tx.transaction.updateMany({
          where: {
            id: transactionId,
            userId,
            recurringId: null,
            installmentPlanId: null,
          },
          data: {
            ...(dto.type !== undefined && { type: dto.type }),
            ...(dto.amount !== undefined && {
              amount: new Prisma.Decimal(dto.amount),
            }),
            ...(dto.description !== undefined && {
              description: dto.description,
            }),
            ...(dto.notes !== undefined && { notes: dto.notes }),
            ...(dto.date !== undefined && {
              date: new Date(`${dto.date}T00:00:00Z`),
            }),
            ...(dto.isPaid !== undefined && { isPaid: dto.isPaid }),
            ...(dto.accountId !== undefined && { accountId: dto.accountId }),
            ...(dto.destinationAccountId !== undefined && {
              destinationAccountId: dto.destinationAccountId,
            }),
            ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          },
        });

        if (updated.count === 0) {
          throw new ConflictException(
            'Transação foi vinculada a recorrência/parcelamento durante a edição',
          );
        }

        if (dto.tagIds !== undefined) {
          await tx.transactionTag.deleteMany({
            where: { transactionId },
          });
          if (dto.tagIds.length > 0) {
            await tx.transactionTag.createMany({
              data: dto.tagIds.map((tagId) => ({ transactionId, tagId })),
            });
          }
        }

        return tx.transaction.findUniqueOrThrow({
          where: { id: transactionId },
          select: TX_SELECT,
        });
      });

      if (result.type === 'EXPENSE' && result.isPaid) {
        finalTxForAlert = {
          id: result.id,
          date: result.date,
          type: result.type,
          isPaid: result.isPaid,
        };
      }

      if (finalTxForAlert) {
        void this.budgetAlertsService
          .evaluateForTransaction({ userId, transactionId: finalTxForAlert.id })
          .catch((err) => this.logger.error('Falha ao avaliar budget', err));
      }

      return result;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'Conta, categoria ou tag foi removida durante a operação',
        );
      }
      throw err;
    }
  }

  async remove(userId: string, transactionId: string) {
    const txToDelete = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      select: {
        id: true,
        type: true,
        categoryId: true,
        date: true,
        isPaid: true,
      },
    });

    const deleted = await this.prisma.transaction.deleteMany({
      where: {
        id: transactionId,
        userId,
        recurringId: null,
        installmentPlanId: null,
      },
    });

    if (deleted.count === 0) {
      const exists = await this.prisma.transaction.findFirst({
        where: { id: transactionId, userId },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException('Transação não encontrada');

      throw new ConflictException(
        'Transação gerada por recorrência/parcelamento não pode ser excluída diretamente. Cancele a regra/plano.',
      );
    }

    if (txToDelete && txToDelete.type === 'EXPENSE' && txToDelete.isPaid) {
      const [y, m] = txToDelete.date
        .toISOString()
        .slice(0, 10)
        .split('-')
        .map(Number);
      void this.budgetAlertsService
        .reevaluateMonth(userId, y, m)
        .catch((err) => this.logger.error('Falha ao reavaliar budget', err));
    }

    return { message: 'Transação excluída' };
  }

  private async assertAccountsUsable(
    client: Prisma.TransactionClient | PrismaService,
    userId: string,
    accountIds: string[],
  ) {
    const unique = [...new Set(accountIds)];
    const accounts = await client.account.findMany({
      where: { id: { in: unique }, userId },
      select: { id: true, archivedAt: true },
    });

    if (accounts.length !== unique.length) {
      throw new NotFoundException(
        'Alguma conta não existe ou não pertence ao usuário',
      );
    }
    const archived = accounts.find((a) => a.archivedAt !== null);
    if (archived) {
      throw new BadRequestException(`Conta ${archived.id} está arquivada`);
    }
  }

  private assertTransferInvariants(final: {
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    accountId: string;
    destinationAccountId: string | null;
    categoryId: string | null;
  }) {
    if (final.type === 'TRANSFER') {
      if (!final.destinationAccountId) {
        throw new BadRequestException(
          'Transferência exige destinationAccountId',
        );
      }
      if (final.destinationAccountId === final.accountId) {
        throw new BadRequestException(
          'Conta de origem e destino devem ser diferentes',
        );
      }
      if (final.categoryId) {
        throw new BadRequestException('Transferência não tem categoria');
      }
    } else {
      if (final.destinationAccountId) {
        throw new BadRequestException(
          'destinationAccountId só é permitido em TRANSFER',
        );
      }
    }
  }

  private async assertCategoryUsable(
    client: Prisma.TransactionClient | PrismaService,
    userId: string,
    categoryId: string,
    transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER',
  ) {
    const category = await client.category.findFirst({
      where: { id: categoryId, userId },
      select: { id: true, type: true, archivedAt: true },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category.archivedAt) {
      throw new BadRequestException('Categoria está arquivada');
    }

    if (category.type !== transactionType) {
      throw new BadRequestException(
        `Categoria é do tipo ${category.type}, mas transação é ${transactionType}`,
      );
    }
  }

  private async assertTagsBelongToUser(
    client: Prisma.TransactionClient | PrismaService,
    userId: string,
    tagIds: string[],
  ) {
    const uniqueTagIds = [...new Set(tagIds)];

    const found = await client.tag.count({
      where: { id: { in: uniqueTagIds }, userId },
    });

    if (found !== uniqueTagIds.length) {
      throw new BadRequestException(
        'Alguma tag não existe ou não pertence ao usuário',
      );
    }
  }
}
