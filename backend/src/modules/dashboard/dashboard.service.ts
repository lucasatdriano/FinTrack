import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AccountBalanceService } from '../accounts/account-balance.service.js';
import type { SummaryQuery } from './dto/summary.query.js';
import type { MonthlyEvolutionQuery } from './dto/monthly-evolution.query.js';
import {
  monthBounds,
  monthsSeries,
  parseYmd,
  shiftDays,
  todayInTz,
} from '../../common/utils/date.utils.js';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountBalanceService: AccountBalanceService,
  ) {}

  async summary(userId: string, query: SummaryQuery) {
    const tz = await this.getUserTimezone(userId);
    const { year, month, today } = this.resolveReference(query.asOf, tz);
    const { from: monthFrom, to: monthTo } = monthBounds(year, month);

    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const { from: prevFrom, to: prevTo } = monthBounds(prevYear, prevMonth);

    const [
      accounts,
      monthAgg,
      prevMonthAgg,
      budgetSpentByCategory,
      topCategories,
      upcoming,
      pendingCount,
      lastImport,
      lastTransactions,
      investedTotals,
      topInvestments,
      budgets,
    ] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId, archivedAt: null },
        select: { id: true, name: true, type: true, color: true, icon: true },
        orderBy: { name: 'asc' },
      }),
      this.monthAggregates(userId, monthFrom, monthTo),
      this.monthAggregates(userId, prevFrom, prevTo),
      this.spentByCategory(userId, monthFrom, monthTo),
      this.topExpenseCategories(userId, monthFrom, monthTo, 5),
      this.prisma.recurringTransaction.findMany({
        where: {
          userId,
          isActive: true,
          nextRunDate: {
            gte: new Date(`${today}T00:00:00Z`),
            lte: new Date(`${shiftDays(today, 7)}T23:59:59.999Z`),
          },
        },
        select: {
          id: true,
          description: true,
          amount: true,
          type: true,
          nextRunDate: true,
          account: { select: { id: true, name: true } },
        },
        orderBy: { nextRunDate: 'asc' },
        take: 5,
      }),
      this.prisma.transaction.count({ where: { userId, isPaid: false } }),
      this.prisma.importBatch.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          format: true,
          importedCount: true,
          createdAt: true,
        },
      }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: 5,
        select: {
          id: true,
          description: true,
          amount: true,
          type: true,
          date: true,
          isPaid: true,
          account: { select: { id: true, name: true, type: true } },
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
        },
      }),
      this.investedTotals(userId, prevTo),
      this.topInvestments(userId, 3, prevTo),
      this.prisma.budget.findMany({
        where: { userId, year, month },
        select: {
          id: true,
          categoryId: true,
          amount: true,
          alertThreshold: true,
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
        },
      }),
    ]);

    const accountIds = accounts.map((a) => a.id);
    const [balanceMap, prevBalanceMap] = await Promise.all([
      this.accountBalanceService.computeBalances(userId, accountIds, today),
      this.accountBalanceService.computeBalances(userId, accountIds, prevTo),
    ]);

    let totalBalance = new Prisma.Decimal(0);
    const accountsWithBalance = accounts.map((a) => {
      const bal = balanceMap.get(a.id) ?? new Prisma.Decimal(0);
      totalBalance = totalBalance.plus(bal);
      return { ...a, balance: bal };
    });

    let prevTotalBalance = new Prisma.Decimal(0);
    for (const a of accounts) {
      prevTotalBalance = prevTotalBalance.plus(
        prevBalanceMap.get(a.id) ?? new Prisma.Decimal(0),
      );
    }

    const budgetCards = budgets.map((b) => {
      const spent =
        budgetSpentByCategory.get(b.categoryId) ?? new Prisma.Decimal(0);
      const pct = b.amount.isZero()
        ? 0
        : spent.dividedBy(b.amount).times(100).toNumber();
      return {
        id: b.id,
        category: b.category,
        amount: b.amount,
        spent,
        remaining: b.amount.minus(spent),
        percentUsed: Math.round(pct * 100) / 100,
        threshold: b.alertThreshold,
        status:
          pct >= 100 ? 'EXCEEDED' : pct >= b.alertThreshold ? 'ALERT' : 'OK',
      };
    });

    return {
      asOf: today,
      referenceMonth: { year, month },
      balances: {
        total: totalBalance,
        changePct: this.percentChange(totalBalance, prevTotalBalance),
        byAccount: accountsWithBalance,
      },
      month: {
        from: monthFrom,
        to: monthTo,
        income: monthAgg.income,
        expense: monthAgg.expense,
        transfers: monthAgg.transfers,
        net: monthAgg.income.minus(monthAgg.expense),
        transactionCount: monthAgg.count,
        incomeChangePct: this.percentChange(
          monthAgg.income,
          prevMonthAgg.income,
        ),
        expenseChangePct: this.percentChange(
          monthAgg.expense,
          prevMonthAgg.expense,
        ),
      },
      investments: {
        total: investedTotals.current,
        changePct: this.percentChange(
          investedTotals.current,
          investedTotals.previous,
        ),
        top: topInvestments,
      },
      budgets: { count: budgets.length, cards: budgetCards },
      topExpenseCategories: topCategories,
      lastTransactions,
      pending: { count: pendingCount },
      upcomingRecurrings: upcoming,
      lastImport: lastImport ?? null,
    };
  }

  async monthlyEvolution(userId: string, query: MonthlyEvolutionQuery) {
    const tz = await this.getUserTimezone(userId);
    const { year, month } = this.resolveReference(query.asOf, tz);
    const series = monthsSeries(year, month, query.months);

    const startYm = monthBounds(series[0].year, series[0].month).from;
    const endYm = monthBounds(year, month).to;

    const rows = await this.prisma.$queryRaw<
      Array<{ ym: string; type: string; total: Prisma.Decimal }>
    >(Prisma.sql`
    SELECT
      to_char(t.date, 'YYYY-MM') AS ym,
      t.type::text AS type,
      COALESCE(SUM(t.amount), 0) AS total
    FROM transactions t
    WHERE t."userId" = ${userId}
      AND t."isPaid" = true
      AND t.type IN ('INCOME', 'EXPENSE')  -- ✅ Mudança 2
      AND t.date >= ${startYm}::date
      AND t.date <= ${endYm}::date
    GROUP BY ym, t.type
  `);

    const map = new Map<
      string,
      { income: Prisma.Decimal; expense: Prisma.Decimal }
    >();
    for (const { year: y, month: m } of series) {
      const ym = `${y}-${String(m).padStart(2, '0')}`;
      map.set(ym, {
        income: new Prisma.Decimal(0),
        expense: new Prisma.Decimal(0),
      });
    }

    for (const row of rows) {
      const entry = map.get(row.ym);
      if (!entry) continue;
      if (row.type === 'INCOME') entry.income = entry.income.plus(row.total);
      else if (row.type === 'EXPENSE')
        entry.expense = entry.expense.plus(row.total);
    }

    return {
      series: Array.from(map.entries()).map(([ym, v]) => ({
        month: ym,
        income: v.income,
        expense: v.expense,
        net: v.income.minus(v.expense),
      })),
    };
  }

  private async getUserTimezone(userId: string): Promise<string> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { timezone: true },
    });
    return settings?.timezone ?? 'America/Sao_Paulo';
  }

  private async monthAggregates(userId: string, from: string, to: string) {
    const rows = await this.prisma.$queryRaw<
      Array<{ type: string; total: Prisma.Decimal; count: bigint }>
    >(Prisma.sql`
      SELECT
        t.type::text AS type,
        COALESCE(SUM(t.amount), 0) AS total,
        COUNT(*) AS count
      FROM transactions t
      WHERE t."userId" = ${userId}
        AND t."isPaid" = true
        AND t.date >= ${from}::date
        AND t.date <= ${to}::date
      GROUP BY t.type
    `);

    let income = new Prisma.Decimal(0);
    let expense = new Prisma.Decimal(0);
    let transfers = new Prisma.Decimal(0);
    let count = 0;

    for (const row of rows) {
      count += Number(row.count);
      if (row.type === 'INCOME') income = income.plus(row.total);
      else if (row.type === 'EXPENSE') expense = expense.plus(row.total);
      else if (row.type === 'TRANSFER') transfers = transfers.plus(row.total);
    }

    return { income, expense, transfers, count };
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

  private async topExpenseCategories(
    userId: string,
    from: string,
    to: string,
    limit: number,
  ) {
    const rows = await this.prisma.$queryRaw<
      Array<{
        categoryId: string;
        name: string;
        icon: string | null;
        color: string | null;
        total: Prisma.Decimal;
      }>
    >(Prisma.sql`
      SELECT
        c.id AS "categoryId",
        c.name,
        c.icon,
        c.color,
        COALESCE(SUM(t.amount), 0) AS total
      FROM transactions t
      INNER JOIN categories c ON c.id = t."categoryId"
      WHERE t."userId" = ${userId}
        AND t."isPaid" = true
        AND t.type = 'EXPENSE'
        AND t.date >= ${from}::date
        AND t.date <= ${to}::date
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY total DESC
      LIMIT ${limit}
    `);

    return rows.map((r) => ({
      category: {
        id: r.categoryId,
        name: r.name,
        icon: r.icon,
        color: r.color,
      },
      total: r.total,
    }));
  }

  private async investedTotals(
    userId: string,
    prevMonthTo: string,
  ): Promise<{ current: Prisma.Decimal; previous: Prisma.Decimal }> {
    const [currentAgg, prevValRows] = await Promise.all([
      this.prisma.investment.aggregate({
        where: { userId, status: 'ACTIVE' },
        _sum: { currentValue: true },
      }),

      this.prisma.$queryRaw<
        Array<{ investmentId: string; value: Prisma.Decimal }>
      >(
        Prisma.sql`
        SELECT DISTINCT ON (v."investmentId")
          v."investmentId", v.value
        FROM investment_valuations v
        INNER JOIN investments i ON i.id = v."investmentId"
        WHERE i."userId" = ${userId}
          AND i.status = 'ACTIVE'
          AND v.date <= ${prevMonthTo}::date
        ORDER BY v."investmentId", v.date DESC
      `,
      ),
    ]);

    const current = currentAgg._sum.currentValue ?? new Prisma.Decimal(0);

    const investments = await this.prisma.investment.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { id: true, appliedAmount: true },
    });
    const prevMap = new Map(prevValRows.map((r) => [r.investmentId, r.value]));
    let previous = new Prisma.Decimal(0);
    for (const inv of investments) {
      previous = previous.plus(prevMap.get(inv.id) ?? inv.appliedAmount);
    }

    return { current, previous };
  }

  private async topInvestments(userId: string, limit: number, prevTo: string) {
    const items = await this.prisma.investment.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { currentValue: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        institution: true,
        type: true,
        currentValue: true,
        appliedAmount: true,
      },
    });

    if (items.length === 0) return [];

    const ids = items.map((i) => i.id);
    const prevRows = await this.prisma.$queryRaw<
      Array<{ investmentId: string; value: Prisma.Decimal }>
    >(Prisma.sql`
    SELECT DISTINCT ON (v."investmentId")
      v."investmentId", v.value
    FROM investment_valuations v
    WHERE v."investmentId" = ANY(${ids}::text[])
      AND v.date <= ${prevTo}::date
    ORDER BY v."investmentId", v.date DESC
  `);

    const prevMap = new Map(prevRows.map((r) => [r.investmentId, r.value]));

    return items.map((i) => {
      const prev = prevMap.get(i.id) ?? i.appliedAmount;
      return {
        id: i.id,
        name: i.name,
        institution: i.institution,
        type: i.type,
        currentValue: i.currentValue,
        monthChange: prev !== null ? i.currentValue.minus(prev) : null,
      };
    });
  }

  private percentChange(
    current: Prisma.Decimal,
    previous: Prisma.Decimal,
  ): number | null {
    if (previous.isZero()) return null;
    return Number(
      current.minus(previous).dividedBy(previous).times(100).toFixed(2),
    );
  }

  private resolveReference(
    asOf: string | undefined,
    tz: string,
  ): { year: number; month: number; today: string } {
    const today = asOf ?? todayInTz(tz);
    const { year, month } = parseYmd(today);
    return { year, month, today };
  }
}
