import { renderLayout } from './layout.js';

interface BudgetAlertEmailProps {
  userName: string;
  categoryName: string;
  amount: string;
  spent: string;
  percentUsed: number;
  exceeded: boolean;
  appUrl?: string;
}

export function budgetAlertEmail({
  userName,
  categoryName,
  amount,
  spent,
  percentUsed,
  exceeded,
  appUrl = process.env.FRONT_URL ?? 'http://localhost:3000',
}: BudgetAlertEmailProps): { subject: string; html: string; text: string } {
  const firstName = userName.split(' ')[0];
  const title = exceeded
    ? `Orçamento de ${categoryName} estourado`
    : `Atenção: ${categoryName} em ${Math.round(percentUsed)}%`;
  const accentColor = exceeded ? '#ef4444' : '#f59e0b';
  const bgColor = exceeded ? '#fee2e2' : '#fef3c7';

  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">${title}</h1>
    <p style="margin:0 0 12px;font-size:15px;color:#374151;">Olá, <strong>${firstName}</strong>.</p>
    <div style="padding:16px;background:${bgColor};border-left:4px solid ${accentColor};border-radius:6px;margin:16px 0;">
      <p style="margin:0;font-size:15px;color:#111827;">
        Você já gastou <strong>${spent}</strong> de <strong>${amount}</strong> em <strong>${categoryName}</strong> este mês.
        ${exceeded ? `<br/><br/>O limite foi ultrapassado em <strong>${percentUsed.toFixed(0)}%</strong>.` : `<br/><br/>Faltam apenas <strong>${(100 - percentUsed).toFixed(0)}%</strong> para o limite.`}
      </p>
    </div>
    <a href="${appUrl}/budgets" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Ver orçamento</a>
  `;

  const text = `
${title}

Olá, ${firstName}.

Você gastou ${spent} de ${amount} em ${categoryName} este mês.
${exceeded ? `Limite ultrapassado em ${percentUsed.toFixed(0)}%.` : `Faltam ${(100 - percentUsed).toFixed(0)}% para o limite.`}

Ver: ${appUrl}/budgets
  `.trim();

  return {
    subject: exceeded ? `🚨 ${title}` : `⚠️ ${title}`,
    html: renderLayout({
      title,
      previewText: exceeded
        ? `Você estourou o orçamento de ${categoryName}.`
        : `Você está em ${Math.round(percentUsed)}% do limite de ${categoryName}.`,
      content,
    }),
    text,
  };
}
