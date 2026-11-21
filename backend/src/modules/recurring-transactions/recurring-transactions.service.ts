import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateRecurringDto } from './dto/create-recurring.dto.js';
import type { UpdateRecurringDto } from './dto/update-recurring.dto.js';
import type { ListRecurringQuery } from './dto/list-recurring.query.js';

const RECURRING_SELECT = {
  id: true,
  type: true,
  amount: true,
  description: true,
  accountId: true,
  destinationAccountId: true,
  categoryId: true,
  frequency: true,
  interval: true,
  startDate: true,
  endDate: true,
  nextRunDate: true,
  lastRunDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  account: { select: { id: true, name: true, type: true } },
  destinationAccount: { select: { id: true, name: true, type: true } },
  category: { select: { id: true, name: true, color: true } },
} as const;

@Injectable()
export class RecurringTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRecurringDto) {
    await this.assertAccountsUsable(userId, [
      dto.accountId,
      ...(dto.destinationAccountId ? [dto.destinationAccountId] : []),
    ]);

    if (dto.categoryId) {
      await this.assertCategoryUsable(userId, dto.categoryId, dto.type);
    }

    try {
      return await this.prisma.recurringTransaction.create({
        data: {
          userId,
          type: dto.type,
          amount: new Prisma.Decimal(dto.amount),
          description: dto.description,
          accountId: dto.accountId,
          destinationAccountId: dto.destinationAccountId ?? null,
          categoryId: dto.categoryId ?? null,
          frequency: dto.frequency,
          interval: dto.interval,
          startDate: new Date(`${dto.startDate}T00:00:00Z`),
          endDate: dto.endDate ? new Date(`${dto.endDate}T00:00:00Z`) : null,
          nextRunDate: new Date(`${dto.startDate}T00:00:00Z`),
        },
        select: RECURRING_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'Conta ou categoria foi removida durante a operação.',
        );
      }
      throw err;
    }
  }

  async list(userId: string, query: ListRecurringQuery) {
    const where: Prisma.RecurringTransactionWhereInput = {
      userId,
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.accountId ? { accountId: query.accountId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.recurringTransaction.findMany({
        where,
        select: RECURRING_SELECT,
        orderBy: { nextRunDate: 'asc' },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      this.prisma.recurringTransaction.count({ where }),
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

  async findOne(userId: string, id: string) {
    const rule = await this.prisma.recurringTransaction.findFirst({
      where: { id, userId },
      select: RECURRING_SELECT,
    });
    if (!rule)
      throw new NotFoundException('Regra de recorrência não encontrada');
    return rule;
  }

  async update(userId: string, id: string, dto: UpdateRecurringDto) {
    const result = await this.prisma.recurringTransaction.updateMany({
      where: { id, userId },
      data: {
        ...(dto.amount !== undefined && {
          amount: new Prisma.Decimal(dto.amount),
        }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(`${dto.endDate}T00:00:00Z`) : null,
        }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Regra de recorrência não encontrada');
    }

    return this.prisma.recurringTransaction.findFirstOrThrow({
      where: { id, userId },
      select: RECURRING_SELECT,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const rule = await tx.recurringTransaction.findFirst({
        where: { id, userId },
        select: { id: true },
      });

      if (!rule) {
        throw new NotFoundException('Regra de recorrência não encontrada');
      }

      const txs = await tx.transaction.count({
        where: { recurringId: id, userId },
      });

      if (txs > 0) {
        throw new ConflictException(
          'Esta regra já gerou transações e não pode ser excluída. Use "isActive: false" para pausá-la.',
        );
      }

      await tx.recurringTransaction.delete({
        where: { id },
      });

      return { message: 'Regra excluída com sucesso' };
    });
  }

  private async assertAccountsUsable(userId: string, accountIds: string[]) {
    const unique = [...new Set(accountIds)];
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: unique }, userId },
      select: { id: true, archivedAt: true },
    });

    if (accounts.length !== unique.length) {
      throw new NotFoundException(
        'Alguma conta não existe ou não pertence ao usuário',
      );
    }
    if (accounts.some((a) => a.archivedAt !== null)) {
      throw new BadRequestException('Alguma conta está arquivada');
    }
  }

  private async assertCategoryUsable(
    userId: string,
    categoryId: string,
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER',
  ) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
      select: { id: true, type: true, archivedAt: true },
    });

    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (category.archivedAt)
      throw new BadRequestException('Categoria está arquivada');
    if (category.type !== type) {
      throw new BadRequestException(
        `Categoria é do tipo ${category.type}, mas transação é ${type}`,
      );
    }
  }
}
