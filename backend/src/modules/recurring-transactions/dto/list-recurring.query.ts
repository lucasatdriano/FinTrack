import { z } from 'zod';
import { BooleanQuery } from '../../../common/validations/boolean.schema.js';

export const ListRecurringQuerySchema = z.object({
  isActive: BooleanQuery.optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  accountId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListRecurringQuery = z.infer<typeof ListRecurringQuerySchema>;
