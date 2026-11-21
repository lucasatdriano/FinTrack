import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';

import { ListNotificationsQuery } from './dto/list-notifications.query.js';
import { dueTransactionEmail } from '../mail/templates/due-transaction.template.js';
import { budgetAlertEmail } from '../mail/templates/budget-alert.template.js';

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  title: true,
  body: true,
  data: true,
  readAt: true,
  createdAt: true,
} as const;

interface CreateNotificationInput {
  userId: string;
  type: Prisma.NotificationCreateInput['type'];
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
  sendEmail?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      },
      select: NOTIFICATION_SELECT,
    });

    if (input.sendEmail) {
      void this.trySendEmail(input).catch((err) =>
        this.logger.error(
          `Falha ao enviar e-mail ${input.type} para ${input.userId}`,
          err instanceof Error ? err.stack : String(err),
        ),
      );
    }

    return notification;
  }

  async sendBudgetAlertEmail(params: {
    userId: string;
    categoryName: string;
    amount: Prisma.Decimal;
    spent: Prisma.Decimal;
    percentUsed: number;
    exceeded: boolean;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        name: true,
        email: true,
        settings: { select: { emailBudgetAlerts: true } },
      },
    });
    if (!user) return;
    if (user.settings?.emailBudgetAlerts === false) return;

    await this.mail.sendBudgetAlertEmail({
      to: user.email,
      userName: user.name,
      categoryName: params.categoryName,
      amount: formatBRL(params.amount),
      spent: formatBRL(params.spent),
      percentUsed: params.percentUsed,
      exceeded: params.exceeded,
    });
  }

  async sendDueTransactionsEmail(params: {
    userId: string;
    transactions: Array<{
      description: string;
      amount: Prisma.Decimal;
      dueDate: Date;
      accountName: string;
      daysUntilDue: number;
    }>;
  }) {
    if (params.transactions.length === 0) return;

    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: { name: true, email: true },
    });
    if (!user) return;

    await this.mail.sendDueTransactionsEmail({
      to: user.email,
      userName: user.name,
      transactions: params.transactions.map((t) => ({
        description: t.description,
        amount: formatBRL(t.amount),
        dueDate: t.dueDate.toISOString().slice(0, 10),
        accountName: t.accountName,
        daysUntilDue: t.daysUntilDue,
      })),
    });
  }

  async list(userId: string, query: ListNotificationsQuery) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(query.unreadOnly ? { readAt: null } : {}),
        ...(query.type ? { type: query.type } : {}),
      },
      select: NOTIFICATION_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
    });
  }

  async countUnread(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { unread: count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: { id: true, readAt: true },
    });
    if (!notif) throw new NotFoundException('Notificação não encontrada');
    if (notif.readAt) return { message: 'Já estava lida' };

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
    return { message: 'Marcada como lida' };
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { marked: result.count };
  }

  async remove(userId: string, notificationId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
    if (result.count === 0)
      throw new NotFoundException('Notificação não encontrada');
    return { message: 'Notificação excluída' };
  }

  private async trySendEmail(input: CreateNotificationInput) {
    this.logger.debug(
      `E-mail genérico não implementado para ${input.type} — use os métodos send*Email específicos.`,
    );
  }
}

function formatBRL(value: Prisma.Decimal): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}
