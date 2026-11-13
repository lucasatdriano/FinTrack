import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { verificationEmail } from './templates/verification.template.js';
import { passwordResetEmail } from './templates/password.template.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = this.config.get<string>('mail.from')!;
    this.appUrl = this.config.get<string>('app.url')!;
  }

  async sendVerificationEmail(to: string, token: string, userName: string) {
    const verifyUrl = `${this.appUrl}/auth/verify-email?token=${token}`;
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
    const resetUrl = `${this.appUrl}/auth/reset-password?token=${token}`;
    const { subject, html, text } = passwordResetEmail({
      userName,
      resetUrl,
      expiresInMinutes: 60,
      requestIp,
    });

    await this.send(to, subject, html, text);
  }

  private async send(to: string, subject: string, html: string, text: string) {
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
