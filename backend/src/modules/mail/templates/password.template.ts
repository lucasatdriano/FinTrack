import { renderButton, renderFallbackLink, renderLayout } from './layout.js';

export interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresInMinutes?: number;
  requestIp?: string;
}

export function passwordResetEmail({
  userName,
  resetUrl,
  expiresInMinutes = 60,
  requestIp,
}: PasswordResetEmailProps): { subject: string; html: string; text: string } {
  const firstName = userName.split(' ')[0];
  const when = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">Redefinir sua senha</h1>

    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Olá, <strong>${firstName}</strong>.
    </p>

    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Recebemos um pedido para redefinir a senha da sua conta no FinTrack.
      Clique no botão abaixo para escolher uma nova senha:
    </p>

    ${renderButton('Redefinir senha', resetUrl)}

    <p style="margin:0;font-size:13px;color:#6b7280;">
      ⏱️ Este link expira em <strong>${expiresInMinutes} minutos</strong>.
    </p>

    ${renderFallbackLink(resetUrl)}

    <div style="margin:24px 0 0;padding:16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
        <strong>Não reconhece este pedido?</strong><br />
        Se você não solicitou a redefinição, ignore este e-mail — sua senha atual
        continua válida. Em caso de dúvida, entre em contato com o suporte.
      </p>
    </div>

    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
      Solicitação feita em ${when}${requestIp ? ` · IP: ${requestIp}` : ''}
    </p>
  `;

  const text = `
Olá, ${firstName}.

Recebemos um pedido para redefinir a senha da sua conta no FinTrack.
Acesse o link abaixo para escolher uma nova senha:

${resetUrl}

Este link expira em ${expiresInMinutes} minutos.

Se você não solicitou a redefinição, ignore este e-mail — sua senha atual continua válida.
  `.trim();

  return {
    subject: 'Redefinição de senha · FinTrack',
    html: renderLayout({
      title: 'Redefinir senha',
      previewText:
        'Você pediu para redefinir a senha da sua conta no FinTrack.',
      content,
    }),
    text,
  };
}
