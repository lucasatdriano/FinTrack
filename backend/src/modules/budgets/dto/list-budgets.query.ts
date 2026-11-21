import { z } from 'zod';
import { BooleanQuery } from '../../../common/validations/boolean.schema.js';

export const ListBudgetsQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  categoryId: z.string().cuid().optional(),
  withUsage: BooleanQuery.default(true),
});

export type ListBudgetsQuery = z.infer<typeof ListBudgetsQuerySchema>;
