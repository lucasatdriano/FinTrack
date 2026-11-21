import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class BudgetAlertsService {
  private readonly logger = new Logger(BudgetAlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async evaluateForTransaction(params: {
    userId: string;
    transactionId: string;
  }): Promise<void> {
    const { userId, transactionId } = params;

    const tx = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        isPaid: true,
        categoryId: true,
      },
    });

    if (!tx) return;

    if (tx.type !== 'EXPENSE' || !tx.isPaid || !tx.categoryId) return;

    const [yearStr, monthStr] = tx.date.toISOString().slice(0, 10).split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);

    const budget = await this.prisma.budget.findFirst({
      where: { userId, categoryId: tx.categoryId, year, month },
      select: {
        id: true,
        amount: true,
        alertThreshold: true,
        alertSentAt: true,
        exceededSentAt: true,
        category: { select: { name: true } },
      },
    });

    if (!budget) return;

    const { from, to } = this.monthBounds(year, month);
    const spent = await this.spentForCategory(userId, tx.categoryId, from, to);

    const pct = budget.amount.isZero()
      ? 0
      : spent.dividedBy(budget.amount).times(100).toNumber();

    if (pct >= 100 && !budget.exceededSentAt) {
      await this.fireExceeded(userId, budget, spent, pct);
      return;
    }

    if (pct >= budget.alertThreshold && !budget.alertSentAt) {
      await this.fireAlert(userId, budget, spent, pct);
    }
  }

  async reevaluateMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<void> {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, year, month },
      select: {
        id: true,
        categoryId: true,
        amount: true,
        alertThreshold: true,
        alertSentAt: true,
        exceededSentAt: true,
        category: { select: { name: true } },
      },
    });

    if (budgets.length === 0) return;

    const { from, to } = this.monthBounds(year, month);
    const spentMap = await this.spentByCategory(userId, from, to);

    for (const budget of budgets) {
      const spent = spentMap.get(budget.categoryId) ?? new Prisma.Decimal(0);
      const pct = budget.amount.isZero()
        ? 0
        : spent.dividedBy(budget.amount).times(100).toNumber();

      if (pct < budget.alertThreshold && budget.alertSentAt) {
        await this.prisma.budget.update({
          where: { id: budget.id },
          data: { alertSentAt: null, exceededSentAt: null },
        });
        continue;
      }

      if (pct < 100 && budget.exceededSentAt) {
        await this.prisma.budget.update({
          where: { id: budget.id },
          data: { exceededSentAt: null },
        });
      }

      if (pct >= 100 && !budget.exceededSentAt) {
        await this.fireExceeded(userId, budget, spent, pct);
      } else if (pct >= budget.alertThreshold && !budget.alertSentAt) {
        await this.fireAlert(userId, budget, spent, pct);
      }
    }
  }

  private async fireAlert(
    userId: string,
    budget: {
      id: string;
      amount: Prisma.Decimal;
      alertThreshold: number;
      category: { name: string };
    },
    spent: Prisma.Decimal,
    pct: number,
  ) {
    try {
      await this.prisma.$transaction([
        this.prisma.budget.update({
          where: { id: budget.id },
          data: { alertSentAt: new Date() },
        }),
        this.prisma.notification.create({
          data: {
            userId,
            type: 'BUDGET_ALERT',
            title: `Orçamento de ${budget.category.name} em ${Math.round(pct)}%`,
            body: `Você já gastou ${formatBRL(spent)} de ${formatBRL(budget.amount)} este mês. Faltam ${formatBRL(budget.amount.minus(spent))} antes de estourar.`,
            data: {
              budgetId: budget.id,
              categoryName: budget.category.name,
              spent: spent.toString(),
              amount: budget.amount.toString(),
              percentUsed: Math.round(pct * 100) / 100,
              kind: 'alert',
            },
          },
        }),
      ]);
      this.logger.log(
        `BUDGET_ALERT disparado: user=${userId} budget=${budget.id} pct=${pct.toFixed(2)}`,
      );
    } catch (err) {
      this.logger.error(
        `Falha ao disparar BUDGET_ALERT budget=${budget.id}`,
        err as Error,
      );
    }
  }

  private async fireExceeded(
    userId: string,
    budget: {
      id: string;
      amount: Prisma.Decimal;
      alertThreshold: number;
      category: { name: string };
    },
    spent: Prisma.Decimal,
    pct: number,
  ) {
    try {
      await this.prisma.$transaction([
        this.prisma.budget.update({
          where: { id: budget.id },
          data: { exceededSentAt: new Date() },
        }),
        this.prisma.notification.create({
          data: {
            userId,
            type: 'BUDGET_EXCEEDED',
            title: `Orçamento de ${budget.category.name} estourado`,
            body: `Você gastou ${formatBRL(spent)} de ${formatBRL(budget.amount)} este mês (${Math.round(pct)}%). Passou ${formatBRL(spent.minus(budget.amount))} do limite.`,
            data: {
              budgetId: budget.id,
              categoryName: budget.category.name,
              spent: spent.toString(),
              amount: budget.amount.toString(),
              percentUsed: Math.round(pct * 100) / 100,
              kind: 'exceeded',
            },
          },
        }),
      ]);
      this.logger.log(
        `BUDGET_EXCEEDED disparado: user=${userId} budget=${budget.id} pct=${pct.toFixed(2)}`,
      );
    } catch (err) {
      this.logger.error(
        `Falha ao disparar BUDGET_EXCEEDED budget=${budget.id}`,
        err as Error,
      );
    }
  }

  private monthBounds(
    year: number,
    month: number,
  ): { from: string; to: string } {
    const mm = String(month).padStart(2, '0');
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return {
      from: `${year}-${mm}-01`,
      to: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
    };
  }

  private async spentForCategory(
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
}

function formatBRL(value: Prisma.Decimal): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}
