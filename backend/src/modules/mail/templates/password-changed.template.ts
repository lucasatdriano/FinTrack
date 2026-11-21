import { renderLayout } from './layout.js';

export interface PasswordChangedEmailProps {
  userName: string;
  changedAt?: Date;
  appUrl?: string;
}

export function passwordChangedEmail({
  userName,
  changedAt = new Date(),
  appUrl = process.env.API_URL ?? 'http://localhost:3001',
}: PasswordChangedEmailProps): { subject: string; html: string; text: string } {
  const firstName = userName.split(' ')[0];
  const when = changedAt.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">Senha alterada com sucesso</h1>

    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Olá, <strong>${firstName}</strong>.
    </p>

    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Sua senha no FinTrack foi alterada em <strong>${when}</strong>.
      Por segurança, encerramos todas as suas sessões ativas — você precisará
      fazer login novamente em outros dispositivos.
    </p>

    <div style="margin:24px 0 0;padding:16px;background:#fee2e2;border-left:4px solid #ef4444;border-radius:6px;">
      <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
        <strong>Não foi você?</strong><br />
        Redefina sua senha imediatamente em
        <a href="${appUrl}/auth/forgot-password" style="color:#991b1b;text-decoration:underline;">
          ${appUrl}/auth/forgot-password
        </a>
        e entre em contato com o suporte.
      </p>
    </div>
  `;

  const text = `
Olá, ${firstName}.

Sua senha no FinTrack foi alterada em ${when}.
Por segurança, encerramos todas as suas sessões ativas.

Não foi você? Redefina sua senha imediatamente: ${appUrl}/auth/forgot-password
  `.trim();

  return {
    subject: 'Sua senha foi alterada · FinTrack',
    html: renderLayout({
      title: 'Senha alterada',
      previewText: 'Sua senha no FinTrack foi alterada com sucesso.',
      content,
    }),
    text,
  };
}
