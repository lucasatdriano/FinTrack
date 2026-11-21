import { z } from 'zod';

export const CopyBudgetsSchema = z.object({
  fromYear: z.number().int().min(2000).max(2100).optional(),
  fromMonth: z.number().int().min(1).max(12).optional(),
  toYear: z.number().int().min(2000).max(2100),
  toMonth: z.number().int().min(1).max(12),
  overwrite: z.boolean().default(false),
});

export type CopyBudgetsDto = z.infer<typeof CopyBudgetsSchema>;
