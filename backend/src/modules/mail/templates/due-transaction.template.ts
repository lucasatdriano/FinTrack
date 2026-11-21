import { renderLayout } from './layout.js';

interface DueTransactionEmailProps {
  userName: string;
  transactions: Array<{
    description: string;
    amount: string;
    dueDate: string;
    accountName: string;
    daysUntilDue: number;
  }>;
  appUrl?: string;
}

export function dueTransactionEmail({
  userName,
  transactions,
  appUrl = process.env.FRONT_URL ?? 'http://localhost:3000',
}: DueTransactionEmailProps): { subject: string; html: string; text: string } {
  const firstName = userName.split(' ')[0];
  const hasOverdue = transactions.some((t) => t.daysUntilDue < 0);
  const title = hasOverdue
    ? 'Você tem contas atrasadas'
    : 'Contas vencendo nos próximos dias';

  const rows = transactions
    .map((t) => {
      const label =
        t.daysUntilDue < 0
          ? `<span style="color:#ef4444;font-weight:600;">Atrasada ${Math.abs(t.daysUntilDue)} dia(s)</span>`
          : t.daysUntilDue === 0
            ? `<span style="color:#f59e0b;font-weight:600;">Vence hoje</span>`
            : `<span style="color:#f59e0b;">Vence em ${t.daysUntilDue} dia(s)</span>`;
      return `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">${t.description}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${t.dueDate}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${t.accountName}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;text-align:right;font-weight:600;">${t.amount}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${label}</td>
        </tr>
      `;
    })
    .join('');

  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">${title}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">Olá, <strong>${firstName}</strong>. Aqui estão as contas que precisam de atenção:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Descrição</th>
          <th style="padding:10px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Vencimento</th>
          <th style="padding:10px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Conta</th>
          <th style="padding:10px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Valor</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:24px;">
      <a href="${appUrl}/transactions?isPaid=false" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Ver contas a pagar</a>
    </div>
  `;

  const text = `
${title}

Olá, ${firstName}.

${transactions.map((t) => `- ${t.description} — ${t.amount} — ${t.dueDate}${t.daysUntilDue < 0 ? ' (ATRASADA)' : ''}`).join('\n')}

Ver: ${appUrl}/transactions?isPaid=false
  `.trim();

  return {
    subject: hasOverdue ? `🔴 ${title}` : `🟡 ${title}`,
    html: renderLayout({
      title,
      previewText: `${transactions.length} conta(s) precisam de atenção.`,
      content,
    }),
    text,
  };
}
