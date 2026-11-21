import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateBudgetDto } from './dto/create-budget.dto.js';
import type { UpdateBudgetDto } from './dto/update-budget.dto.js';
import type { ListBudgetsQuery } from './dto/list-budgets.query.js';
import type { CopyBudgetsDto } from './dto/copy-budgets.dto.js';
import { monthBounds } from '../../common/utils/date.utils.js';

const BUDGET_SELECT = {
  id: true,
  year: true,
  month: true,
  amount: true,
  alertThreshold: true,
  categoryId: true,
  alertSentAt: true,
  exceededSentAt: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, icon: true, color: true } },
} as const;

export interface BudgetUsage {
  spent: Prisma.Decimal;
  remaining: Prisma.Decimal;
  percentUsed: number;
  status: 'OK' | 'ALERT' | 'EXCEEDED';
}

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, userId },
      select: { id: true, type: true, archivedAt: true },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (category.archivedAt) {
      throw new BadRequestException('Categoria está arquivada');
    }
    if (category.type !== 'EXPENSE') {
      throw new BadRequestException(
        'Orçamento só pode ser criado para categorias de despesa (EXPENSE)',
      );
    }

    try {
      return await this.prisma.budget.create({
        data: {
          userId,
          categoryId: dto.categoryId,
          year: dto.year,
          month: dto.month,
          amount: new Prisma.Decimal(dto.amount),
          alertThreshold: dto.alertThreshold,
        },
        select: BUDGET_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe um orçamento para essa categoria nesse mês',
        );
      }
      throw err;
    }
  }

  async list(userId: string, query: ListBudgetsQuery) {
    const { year, month } = await this.resolveYearMonth(userId, query);

    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        year,
        month,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      },
      select: BUDGET_SELECT,
      orderBy: [{ category: { name: 'asc' } }],
    });

    if (!query.withUsage || budgets.length === 0) {
      return budgets.map((b) => ({
        ...b,
        usage: null,
      }));
    }

    const { from, to } = monthBounds(year, month);
    const spentByCategory = await this.spentByCategory(userId, from, to);

    return budgets.map((b) => {
      const spent = spentByCategory.get(b.categoryId) ?? new Prisma.Decimal(0);
      return {
        ...b,
        usage: this.computeUsage(b.amount, spent, b.alertThreshold),
      };
    });
  }

  async findOne(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, userId },
      select: BUDGET_SELECT,
    });
    if (!budget) throw new NotFoundException('Orçamento não encontrado');

    const { from, to } = monthBounds(budget.year, budget.month);
    const spent = await this.spentByCategoryForOne(
      userId,
      budget.categoryId,
      from,
      to,
    );

    return {
      ...budget,
      usage: this.computeUsage(budget.amount, spent, budget.alertThreshold),
    };
  }

  async update(userId: string, budgetId: string, dto: UpdateBudgetDto) {
    const result = await this.prisma.budget.updateMany({
      where: { id: budgetId, userId },
      data: {
        ...(dto.amount !== undefined && {
          amount: new Prisma.Decimal(dto.amount),
        }),
        ...(dto.alertThreshold !== undefined && {
          alertThreshold: dto.alertThreshold,
        }),
        ...(dto.amount !== undefined && {
          alertSentAt: null,
          exceededSentAt: null,
        }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return this.prisma.budget.findFirstOrThrow({
      where: { id: budgetId, userId },
      select: BUDGET_SELECT,
    });
  }

  async remove(userId: string, budgetId: string) {
    const result = await this.prisma.budget.deleteMany({
      where: { id: budgetId, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return { message: 'Orçamento excluído' };
  }

  async copyFromPreviousMonth(userId: string, dto: CopyBudgetsDto) {
    const { year, month } = await this.resolveYearMonth(userId, {
      year: dto.toYear,
      month: dto.toMonth,
    });

    const fromYear = dto.fromYear ?? (month === 1 ? year - 1 : year);
    const fromMonth = dto.fromMonth ?? (month === 1 ? 12 : month - 1);

    if (fromYear === year && fromMonth === month) {
      throw new BadRequestException(
        'Mês de origem e destino não podem ser iguais',
      );
    }

    const sourceBudgets = await this.prisma.budget.findMany({
      where: { userId, year: fromYear, month: fromMonth },
      select: {
        id: true,
        categoryId: true,
        amount: true,
        alertThreshold: true,
      },
    });

    if (sourceBudgets.length === 0) {
      return {
        message: 'Nenhum orçamento para copiar',
        copied: 0,
        skipped: 0,
      };
    }

    let toCopy = sourceBudgets;
    if (!dto.overwrite) {
      const existing = await this.prisma.budget.findMany({
        where: {
          userId,
          year,
          month,
          categoryId: { in: sourceBudgets.map((b) => b.categoryId) },
        },
        select: { categoryId: true },
      });
      const existingSet = new Set(existing.map((b) => b.categoryId));
      toCopy = sourceBudgets.filter((b) => !existingSet.has(b.categoryId));
    }

    if (toCopy.length === 0) {
      return {
        message: 'Todos os orçamentos já existem no destino',
        copied: 0,
        skipped: sourceBudgets.length,
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (dto.overwrite) {
        await tx.budget.deleteMany({
          where: {
            userId,
            year,
            month,
            categoryId: { in: sourceBudgets.map((b) => b.categoryId) },
          },
        });
      }

      const created = await tx.budget.createMany({
        data: toCopy.map((b) => ({
          userId,
          categoryId: b.categoryId,
          year,
          month,
          amount: b.amount,
          alertThreshold: b.alertThreshold,
        })),
        skipDuplicates: !dto.overwrite,
      });

      return created.count;
    });

    return {
      message: 'Orçamentos copiados',
      copied: result,
      skipped: sourceBudgets.length - toCopy.length,
    };
  }

  private async resolveYearMonth(
    userId: string,
    query: { year?: number; month?: number },
  ): Promise<{ year: number; month: number }> {
    if (query.year !== undefined && query.month !== undefined) {
      return { year: query.year, month: query.month };
    }
    const tz = await this.getUserTimezone(userId);
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const [y, m] = today.split('-').map(Number);
    return { year: query.year ?? y, month: query.month ?? m };
  }

  private async getUserTimezone(userId: string): Promise<string> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { timezone: true },
    });
    return settings?.timezone ?? 'America/Sao_Paulo';
  }

  private async spentByCategory(
    userId: string,
    from: string,
    to: string,
  ): Promise<Map<string, Prisma.Decimal>> {
    const rows = await this.prisma.$queryRaw<
      Array<{ categoryId: string; total: Prisma.Decimal }>
    >(Prisma.sql`
      SELECT
        t."categoryId" AS "categoryId",
        COALESCE(SUM(t.amount), 0) AS total
      FROM transactions t
      WHERE t."userId" = ${userId}
        AND t."isPaid" = true
        AND t.type = 'EXPENSE'
        AND t."categoryId" IS NOT NULL
        AND t.date >= ${from}::date
        AND t.date <= ${to}::date
      GROUP BY t."categoryId"
    `);

    const map = new Map<string, Prisma.Decimal>();
    for (const row of rows) map.set(row.categoryId, row.total);
    return map;
  }

  private async spentByCategoryForOne(
    userId: string,
    categoryId: string,
    from: string,
    to: string,
  ): Promise<Prisma.Decimal> {
    const rows = await this.prisma.$queryRaw<
      Array<{ total: Prisma.Decimal }>
    >(Prisma.sql`
      SELECT COALESCE(SUM(t.amount), 0) AS total
      FROM transactions t
      WHERE t."userId" = ${userId}
        AND t."isPaid" = true
        AND t.type = 'EXPENSE'
        AND t."categoryId" = ${categoryId}
        AND t.date >= ${from}::date
        AND t.date <= ${to}::date
    `);
    return rows[0]?.total ?? new Prisma.Decimal(0);
  }

  private computeUsage(
    amount: Prisma.Decimal,
    spent: Prisma.Decimal,
    threshold: number,
  ): BudgetUsage {
    const pct = amount.isZero()
      ? 0
      : spent.dividedBy(amount).times(100).toNumber();

    return {
      spent,
      remaining: amount.minus(spent),
      percentUsed: Math.round(pct * 100) / 100,
      status: pct >= 100 ? 'EXCEEDED' : pct >= threshold ? 'ALERT' : 'OK',
    };
  }
}
