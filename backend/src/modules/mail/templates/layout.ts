export interface LayoutOptions {
  title: string;
  previewText: string;
  content: string;
  appName?: string;
  appUrl?: string;
}

export function renderLayout({
  title,
  previewText,
  content,
  appName = 'FinTrack',
  appUrl = process.env.APP_URL ?? 'http://localhost:3000',
}: LayoutOptions): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${previewText}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);">
            <tr>
              <td style="background:#0f172a;padding:24px 32px;">
                <a href="${appUrl}" style="text-decoration:none;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">
                  ${appName}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.5;">
                Você recebeu este e-mail porque possui uma conta no ${appName}.<br />
                Se não foi você, ignore esta mensagem.
                <br /><br />
                <a href="${appUrl}" style="color:#6b7280;text-decoration:underline;">${appName}</a>
              </td>
            </tr>
          </table>

          <div style="max-width:560px;margin:16px auto 0;text-align:center;color:#9ca3af;font-size:11px;">
            © ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderButton(label: string, href: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:8px;background:#2563eb;">
        <a href="${href}"
           style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

export function renderFallbackLink(href: string): string {
  return `
  <p style="margin:16px 0 8px;font-size:13px;color:#6b7280;">
    Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
  </p>
  <p style="margin:0;padding:12px;background:#f3f4f6;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#374151;word-break:break-all;">
    ${href}
  </p>`;
}
