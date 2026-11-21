import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { verificationEmail } from './templates/verification.template.js';
import { passwordResetEmail } from './templates/password-reset.template.js';
import { passwordChangedEmail } from './templates/password-changed.template.js';
import { budgetAlertEmail } from './templates/budget-alert.template.js';
import { dueTransactionEmail } from './templates/due-transaction.template.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly frontUrl: string;
  private readonly isProd: boolean;

  constructor(private readonly config: ConfigService) {
    const apiKey = process.env.RESEND_API_KEY;
    this.isProd = this.config.get('app.nodeEnv') === 'production';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
      if (this.isProd) {
        throw new Error('RESEND_API_KEY ausente em produção');
      }
      this.logger.warn(
        'RESEND_API_KEY não definida — e-mails serão impressos no console (dev only).',
      );
    }

    this.from = this.config.get<string>('mail.from')!;
    this.frontUrl = this.config.get<string>('app.frontUrl')!;
  }

  async sendVerificationEmail(to: string, token: string, userName: string) {
    const verifyUrl = `${this.frontUrl}/verify-email?token=${token}`;
    const { subject, html, text } = verificationEmail({
      userName,
      verifyUrl,
      expiresInHours: 24,
    });
    await this.send(to, subject, html, text);
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    userName: string,
    requestIp?: string,
  ) {
    const resetUrl = `${this.frontUrl}/reset-password?token=${token}`;
    const { subject, html, text } = passwordResetEmail({
      userName,
      resetUrl,
      expiresInMinutes: 60,
      requestIp,
    });
    await this.send(to, subject, html, text);
  }

  async sendPasswordChangedEmail(to: string, userName: string) {
    const { subject, html, text } = passwordChangedEmail({ userName });
    await this.send(to, subject, html, text);
  }

  async sendBudgetAlertEmail(params: {
    to: string;
    userName: string;
    categoryName: string;
    amount: string;
    spent: string;
    percentUsed: number;
    exceeded: boolean;
  }) {
    const { subject, html, text } = budgetAlertEmail({
      userName: params.userName,
      categoryName: params.categoryName,
      amount: params.amount,
      spent: params.spent,
      percentUsed: params.percentUsed,
      exceeded: params.exceeded,
    });
    await this.send(params.to, subject, html, text);
  }

  async sendDueTransactionsEmail(params: {
    to: string;
    userName: string;
    transactions: Array<{
      description: string;
      amount: string;
      dueDate: string;
      accountName: string;
      daysUntilDue: number;
    }>;
  }) {
    if (params.transactions.length === 0) return;

    const { subject, html, text } = dueTransactionEmail({
      userName: params.userName,
      transactions: params.transactions,
    });
    await this.send(params.to, subject, html, text);
  }

  async send(to: string, subject: string, html: string, text: string) {
    if (!this.resend) {
      this.logger.log(`[MAIL:dev] to=${to} subject="${subject}"`);
      this.logger.debug(text);
      return;
    }
    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
      });
      if (error) this.logger.error(`Resend error: ${error.message}`);
    } catch (err) {
      this.logger.error(
        `Falha ao enviar e-mail para ${to}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
