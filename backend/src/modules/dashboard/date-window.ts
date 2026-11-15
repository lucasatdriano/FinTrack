/**
 * Operações de calendário no timezone do usuário.
 * Tudo retorna string YYYY-MM-DD (date puro), não Date, porque
 * `Transaction.date` é `@db.Date` — não instante.
 */

export function todayInTz(tz: string): string {
  // Intl com timeZone devolve "2025-01-15" sem ambiguidade
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // en-CA usa formato YYYY-MM-DD
  return fmt.format(new Date());
}

export function monthBounds(
  year: number,
  month1to12: number,
): {
  from: string;
  to: string;
} {
  const mm = String(month1to12).padStart(2, '0');
  const lastDay = new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function parseYmd(ymd: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = ymd.split('-').map(Number);
  return { year: y, month: m, day: d };
}

/** Mês atual (ou `asOf`) → ano e mês. */
export function resolveReference(
  asOf: string | undefined,
  tz: string,
): { year: number; month: number; today: string } {
  const today = asOf ?? todayInTz(tz);
  const { year, month } = parseYmd(today);
  return { year, month, today };
}

/** N meses atrás (mês completo, do primeiro ao último dia). */
export function lastNMonthsBounds(
  year: number,
  month1to12: number,
  n: number,
): { from: string; to: string } {
  const totalMonths = year * 12 + (month1to12 - 1) - (n - 1);
  const y = Math.floor(totalMonths / 12);
  const m = (totalMonths % 12) + 1;
  return monthBounds(y, m);
}

/** Lista de (year, month) de N meses atrás até o atual, ordem cronológica. */
export function monthsSeries(
  year: number,
  month1to12: number,
  count: number,
): Array<{ year: number; month: number }> {
  const out: Array<{ year: number; month: number }> = [];
  for (let i = count - 1; i >= 0; i--) {
    const total = year * 12 + (month1to12 - 1) - i;
    out.push({ year: Math.floor(total / 12), month: (total % 12) + 1 });
  }
  return out;
}

export function shiftDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + days);
  const yy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(base.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
