import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { verificationEmail } from './templates/verification.template.js';
import { passwordResetEmail } from './templates/password-reset.template.js';
import { passwordChangedEmail } from './templates/password-changed.template.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly appUrl: string;
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
    this.appUrl = this.config.get<string>('app.frontUrl')!;
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

  private async send(to: string, subject: string, html: string, text: string) {
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
      this.logger.error(`Falha ao enviar e-mail para ${to}`, err as Error);
    }
  }
}
