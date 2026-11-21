import { z } from 'zod';

export const MonthlyEvolutionQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
  asOf: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type MonthlyEvolutionQuery = z.infer<typeof MonthlyEvolutionQuerySchema>;
