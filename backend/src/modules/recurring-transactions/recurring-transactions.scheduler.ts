import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BudgetAlertsService } from '../budgets/budget-alerts.service.js';
import { addFrequency } from '../../common/utils/date.utils.js';
import { Prisma } from '../../generated/prisma/client.js';

const MAX_OCCURRENCES_PER_RULE = 60;

const RULE_SELECT = {
  id: true,
  userId: true,
  type: true,
  amount: true,
  description: true,
  accountId: true,
  destinationAccountId: true,
  categoryId: true,
  frequency: true,
  interval: true,
  endDate: true,
  nextRunDate: true,
} as const;

@Injectable()
export class RecurringTransactionsScheduler {
  private readonly logger = new Logger(RecurringTransactionsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly budgetAlertsService: BudgetAlertsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'process_recurring',
    timeZone: 'UTC',
  })
  async handleCron() {
    this.logger.log('Iniciando processamento de transações recorrentes...');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dueRecurrings = await this.prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextRunDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      select: RULE_SELECT,
    });

    if (dueRecurrings.length === 0) {
      this.logger.log('Nenhuma regra para processar hoje.');
      return;
    }

    this.logger.log(
      `Encontradas ${dueRecurrings.length} regras para processar.`,
    );

    for (const rule of dueRecurrings) {
      await this.processRule(rule, today);
    }

    this.logger.log('Processamento de recorrências finalizado.');
  }

  private async processRule(
    rule: Prisma.RecurringTransactionGetPayload<{ select: typeof RULE_SELECT }>,
    today: Date,
  ) {
    let processedCount = 0;
    let currentRule = rule;

    while (processedCount < MAX_OCCURRENCES_PER_RULE) {
      if (currentRule.nextRunDate > today) break;
      if (
        currentRule.endDate &&
        currentRule.nextRunDate > currentRule.endDate
      ) {
        break;
      }

      const result = await this.processOneOccurrence(currentRule, today);
      if (!result) break;

      processedCount++;
      currentRule = result.updatedRule;
    }

    if (processedCount > 0) {
      this.logger.log(
        `Regra ${rule.id}: ${processedCount} ocorrência(s) processada(s)`,
      );
    }
  }

  private async processOneOccurrence(
    rule: Prisma.RecurringTransactionGetPayload<{ select: typeof RULE_SELECT }>,
    today: Date,
  ): Promise<{
    createdTxId: string;
    updatedRule: Prisma.RecurringTransactionGetPayload<{
      select: typeof RULE_SELECT;
    }>;
  } | null> {
    const runDate = rule.nextRunDate;
    const nextDate = addFrequency(runDate, rule.frequency, rule.interval);

    try {
      const createdTx = await this.prisma.$transaction(async (tx) => {
        const claimed = await tx.recurringTransaction.updateMany({
          where: {
            id: rule.id,
            userId: rule.userId,
            isActive: true,
            nextRunDate: runDate,
            endDate: rule.endDate,
            AND: [{ nextRunDate: { lte: today } }],
          },
          data: {
            lastRunDate: runDate,
            nextRunDate: nextDate,
            ...(rule.endDate && nextDate > rule.endDate
              ? { isActive: false }
              : {}),
          },
        });

        if (claimed.count === 0) {
          this.logger.debug(
            `Regra ${rule.id}: CAS falhou — provavelmente processada por outra instância.`,
          );
          return null;
        }

        const created = await tx.transaction.create({
          data: {
            userId: rule.userId,
            type: rule.type,
            amount: rule.amount,
            description: rule.description,
            date: runDate,
            isPaid: true,
            accountId: rule.accountId,
            destinationAccountId: rule.destinationAccountId,
            categoryId: rule.categoryId,
            recurringId: rule.id,
          },
          select: { id: true, type: true, isPaid: true, date: true },
        });

        const updatedRule = await tx.recurringTransaction.findUniqueOrThrow({
          where: { id: rule.id },
          select: RULE_SELECT,
        });

        return { created, updatedRule };
      });

      if (!createdTx) return null;

      if (createdTx.created.type === 'EXPENSE' && createdTx.created.isPaid) {
        try {
          await this.budgetAlertsService.evaluateForTransaction({
            userId: rule.userId,
            transactionId: createdTx.created.id,
          });
        } catch (err) {
          this.logger.error(
            `Falha no budget alert para tx ${createdTx.created.id}`,
            err as Error,
          );
        }
      }

      return {
        createdTxId: createdTx.created.id,
        updatedRule: createdTx.updatedRule,
      };
    } catch (err) {
      this.logger.error(`Falha ao processar regra ${rule.id}`, err as Error);
      return null;
    }
  }
}
