import { RecurrenceFrequency } from '../../generated/prisma/client.js';

export function todayInTz(tz: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function monthBounds(
  year: number,
  month: number,
): {
  from: string;
  to: string;
} {
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

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

export function shiftDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + days);
  const yy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(base.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function addFrequency(
  date: Date,
  frequency: RecurrenceFrequency,
  interval: number,
): Date {
  const next = new Date(date);
  const originalDay = next.getUTCDate();

  switch (frequency) {
    case 'DAILY':
      next.setUTCDate(next.getUTCDate() + interval);
      break;
    case 'WEEKLY':
      next.setUTCDate(next.getUTCDate() + 7 * interval);
      break;
    case 'MONTHLY':
      const targetMonth = next.getUTCMonth() + interval;
      next.setUTCDate(1);
      next.setUTCMonth(targetMonth);

      const lastDay = new Date(
        Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
      ).getUTCDate();

      next.setUTCDate(Math.min(originalDay, lastDay));
      break;
    case 'YEARLY':
      next.setUTCFullYear(next.getUTCFullYear() + interval);
      if (next.getUTCDate() !== originalDay) {
        next.setUTCDate(0);
      }
      break;
  }
  return next;
}
