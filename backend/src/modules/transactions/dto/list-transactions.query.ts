import { z } from 'zod';
import { TransactionTypeSchema } from './transaction.schema.js';
import { BooleanQuery } from '../../../common/validations/boolean.schema.js';

export const ListTransactionsQuerySchema = z.object({
  type: TransactionTypeSchema.optional(),
  accountId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  isPaid: BooleanQuery.optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  search: z.string().trim().min(1).max(80).optional(),

  orderBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),

  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListTransactionsQuery = z.infer<typeof ListTransactionsQuerySchema>;
