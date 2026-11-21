import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ListMarketRatesQuery } from './dto/list-market-rates.query.js';

const RATE_SELECT = {
  id: true,
  indicator: true,
  date: true,
  value: true,
} as const;

@Injectable()
export class MarketRatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListMarketRatesQuery) {
    const where: Prisma.MarketRateWhereInput = {
      ...(query.indicator ? { indicator: query.indicator } : {}),
      ...(query.from || query.to
        ? {
            date: {
              ...(query.from && {
                gte: new Date(`${query.from}T00:00:00.000Z`),
              }),
              ...(query.to && {
                lte: new Date(`${query.to}T00:00:00.000Z`),
              }),
            },
          }
        : {}),
    };

    return this.prisma.marketRate.findMany({
      where,
      select: RATE_SELECT,
      orderBy: [{ indicator: 'asc' }, { date: 'desc' }],
    });
  }

  async upsertRate(
    indicator: Prisma.MarketRateCreateInput['indicator'],
    date: Date,
    value: number,
  ) {
    return this.prisma.marketRate.upsert({
      where: {
        indicator_date: {
          indicator,
          date,
        },
      },
      create: {
        indicator,
        date,
        value: new Prisma.Decimal(value),
      },
      update: {
        value: new Prisma.Decimal(value),
      },
      select: RATE_SELECT,
    });
  }

  async getLatestRate(
    indicator: Prisma.MarketRateCreateInput['indicator'],
    asOf?: Date,
  ) {
    const rate = await this.prisma.marketRate.findFirst({
      where: {
        indicator,
        ...(asOf && { date: { lte: asOf } }),
      },
      orderBy: { date: 'desc' },
      select: { date: true, value: true },
    });
    return rate;
  }

  async hasAnyRates(): Promise<boolean> {
    const count = await this.prisma.marketRate.count({ take: 1 });
    return count > 0;
  }
}
