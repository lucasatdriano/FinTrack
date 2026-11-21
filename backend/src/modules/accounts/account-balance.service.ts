import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AccountBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula o saldo de VÁRIAS contas em 1 round-trip.
   *
   * Fórmula (do schema):
   *   initialBalance
   *   + SUM(INCOME   em accountId)
   *   - SUM(EXPENSE  em accountId)
   *   - SUM(TRANSFER saindo de accountId)
   *   + SUM(TRANSFER entrando em destinationAccountId)
   *   onde isPaid = true.
   *
   * `asOf` (YYYY-MM-DD) limita `date <= asOf` (inclusive, fim do dia UTC).
   */
  async computeBalances(
    userId: string,
    accountIds: string[],
    asOf?: string,
  ): Promise<Map<string, Prisma.Decimal>> {
    if (accountIds.length === 0) return new Map();

    const asOfDate = asOf ? new Date(`${asOf}T23:59:59.999Z`) : null;
    const asOfSql = asOf
      ? Prisma.sql`AND t.date <= ${asOf}::date`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      Array<{ accountId: string; delta: Prisma.Decimal }>
    >(Prisma.sql`
      WITH movements AS (
        SELECT
          t."accountId" AS account_id,
          CASE
            WHEN t.type = 'INCOME'   THEN  t.amount
            WHEN t.type = 'EXPENSE'  THEN -t.amount
            WHEN t.type = 'TRANSFER' THEN -t.amount
          END AS delta
        FROM transactions t
        WHERE t."userId" = ${userId}
          AND t."isPaid" = true
          AND t."accountId" = ANY(${accountIds}::text[])
          ${asOfSql}

        UNION ALL

        SELECT
          t."destinationAccountId" AS account_id,
          t.amount AS delta
        FROM transactions t
        WHERE t."userId" = ${userId}
          AND t."isPaid" = true
          AND t.type = 'TRANSFER'
          AND t."destinationAccountId" = ANY(${accountIds}::text[])
          ${asOfSql}
      )
      SELECT account_id AS "accountId", COALESCE(SUM(delta), 0) AS delta
      FROM movements
      GROUP BY account_id
    `);

    const accounts = await this.prisma.account.findMany({
      where: {
        id: { in: accountIds },
        userId,
        ...(asOfDate && { createdAt: { lte: asOfDate } }),
      },
      select: { id: true, initialBalance: true },
    });

    const result = new Map<string, Prisma.Decimal>();
    for (const a of accounts) result.set(a.id, a.initialBalance);
    for (const row of rows) {
      const current = result.get(row.accountId) ?? new Prisma.Decimal(0);
      result.set(row.accountId, current.plus(row.delta));
    }
    return result;
  }

  async computeBalance(
    userId: string,
    accountId: string,
    asOf?: string,
  ): Promise<Prisma.Decimal> {
    const map = await this.computeBalances(userId, [accountId], asOf);
    return map.get(accountId) ?? new Prisma.Decimal(0);
  }
}
