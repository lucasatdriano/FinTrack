import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from './notifications.service.js';

const DUE_SOON_DAYS = 3;
const OVERDUE_DAYS = 30;

@Injectable()
export class DueTransactionsScheduler {
  private readonly logger = new Logger(DueTransactionsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM, {
    name: 'notify_due_transactions',
    timeZone: 'America/Sao_Paulo',
  })
  async notifyDueTransactions() {
    this.logger.log('Verificando contas a vencer...');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dueSoonUntil = new Date(today);
    dueSoonUntil.setUTCDate(dueSoonUntil.getUTCDate() + DUE_SOON_DAYS);

    const overdueSince = new Date(today);
    overdueSince.setUTCDate(overdueSince.getUTCDate() - OVERDUE_DAYS);

    const pending = await this.prisma.transaction.findMany({
      where: {
        isPaid: false,
        date: { gte: overdueSince, lte: dueSoonUntil },
        type: 'EXPENSE',
      },
      select: {
        id: true,
        userId: true,
        description: true,
        amount: true,
        date: true,
        account: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    });

    if (pending.length === 0) {
      this.logger.log('Nenhuma conta a vencer.');
      return;
    }

    const byUser = new Map<string, typeof pending>();
    for (const tx of pending) {
      const list = byUser.get(tx.userId) ?? [];
      list.push(tx);
      byUser.set(tx.userId, list);
    }

    let notifiedUsers = 0;
    for (const [userId, txs] of byUser) {
      try {
        const alreadyNotified = await this.prisma.notification.count({
          where: {
            userId,
            type: { in: ['TRANSACTION_DUE_SOON', 'TRANSACTION_OVERDUE'] },
            createdAt: { gte: today },
          },
        });
        if (alreadyNotified > 0) continue;

        const hasOverdue = txs.some((t) => t.date < today);
        const type = hasOverdue
          ? 'TRANSACTION_OVERDUE'
          : 'TRANSACTION_DUE_SOON';

        const summary = txs
          .slice(0, 3)
          .map((t) => t.description)
          .join(', ');
        const more = txs.length > 3 ? ` e mais ${txs.length - 3}` : '';

        await this.notifications.create({
          userId,
          type,
          title: hasOverdue
            ? `${txs.length} conta(s) atrasada(s)`
            : `${txs.length} conta(s) vencendo`,
          body: `${summary}${more}`,
          data: {
            transactionIds: txs.map((t) => t.id),
            count: txs.length,
          },
        });

        await this.notifications.sendDueTransactionsEmail({
          userId,
          transactions: txs.map((t) => ({
            description: t.description,
            amount: t.amount,
            dueDate: t.date,
            accountName: t.account.name,
            daysUntilDue: Math.floor(
              (t.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            ),
          })),
        });

        notifiedUsers++;
      } catch (err) {
        this.logger.error(
          `Falha ao notificar user=${userId}`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    }

    this.logger.log(`Notificados: ${notifiedUsers}/${byUser.size} usuários.`);
  }
}
