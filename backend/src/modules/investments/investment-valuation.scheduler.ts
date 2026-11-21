import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InvestmentsCalculatorService } from './investments-calculator.service.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class InvestmentsValuationScheduler {
  private readonly logger = new Logger(InvestmentsValuationScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: InvestmentsCalculatorService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_5AM, {
    name: 'revaluate_investments',
    timeZone: 'UTC',
  })
  async revaluateAll() {
    this.logger.log('Iniciando reavaliação de investimentos...');

    const investments = await this.prisma.investment.findMany({
      where: { status: 'ACTIVE' },
    });

    if (investments.length === 0) {
      this.logger.log('Nenhum investimento ativo.');
      return;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let updated = 0;
    let failed = 0;

    for (const inv of investments) {
      try {
        const newValue = await this.calculator.calculate(inv);

        await this.prisma.$transaction([
          this.prisma.investment.update({
            where: { id: inv.id },
            data: { currentValue: newValue, lastValuedAt: new Date() },
          }),
          this.prisma.investmentValuation.upsert({
            where: {
              investmentId_date: { investmentId: inv.id, date: today },
            },
            create: { investmentId: inv.id, date: today, value: newValue },
            update: { value: newValue },
          }),
        ]);
        updated++;
      } catch (err) {
        failed++;
        this.logger.error(`Falha ao reavaliar ${inv.id}`, err as Error);
      }
    }

    this.logger.log(
      `Reavaliação concluída: ${updated} atualizados, ${failed} falhas.`,
    );
  }
}
