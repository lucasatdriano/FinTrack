import { renderButton, renderFallbackLink, renderLayout } from './layout.js';

export interface VerificationEmailProps {
  userName: string;
  verifyUrl: string;
  expiresInHours?: number;
}

export function verificationEmail({
  userName,
  verifyUrl,
  expiresInHours = 24,
}: VerificationEmailProps): { subject: string; html: string; text: string } {
  const firstName = userName.split(' ')[0];

  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">Confirme seu e-mail</h1>

    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Olá, <strong>${firstName}</strong>! 👋
    </p>

    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Que bom ter você por aqui. Para ativar sua conta no FinTrack e começar a
      organizar suas finanças, confirme seu endereço de e-mail clicando no
      botão abaixo:
    </p>

    ${renderButton('Confirmar e-mail', verifyUrl)}

    <p style="margin:0;font-size:13px;color:#6b7280;">
      ⏱️ Este link expira em <strong>${expiresInHours} horas</strong>.
    </p>

    ${renderFallbackLink(verifyUrl)}

    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
      Se você não criou uma conta no FinTrack, pode ignorar este e-mail com segurança.
    </p>
  `;

  const text = `
Olá, ${firstName}!

Confirme seu e-mail para ativar sua conta no FinTrack:

${verifyUrl}

Este link expira em ${expiresInHours} horas.
Se você não criou uma conta, ignore este e-mail.
  `.trim();

  return {
    subject: 'Confirme seu e-mail no FinTrack',
    html: renderLayout({
      title: 'Confirme seu e-mail',
      previewText: 'Falta só um clique para ativar sua conta no FinTrack.',
      content,
    }),
    text,
  };
}
