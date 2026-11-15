import { z } from 'zod';

export const MonthlyEvolutionQuerySchema = z.object({
  /** Quantos meses pra trás (incluindo o atual). Default 6, max 24. */
  months: z.coerce.number().int().min(1).max(24).default(6),
  /** Data de referência pro "mês atual". Se ausente, hoje no TZ do usuário. */
  asOf: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type MonthlyEvolutionQuery = z.infer<typeof MonthlyEvolutionQuerySchema>;
