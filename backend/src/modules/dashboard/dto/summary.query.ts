import { z } from 'zod';

export const SummaryQuerySchema = z.object({
  asOf: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional(),
});

export type SummaryQuery = z.infer<typeof SummaryQuerySchema>;
