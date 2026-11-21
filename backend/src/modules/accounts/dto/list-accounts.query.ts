import { z } from 'zod';
import { AccountTypeSchema } from './account.schema.js';
import { BooleanQuery } from '../../../common/validations/boolean.schema.js';

export const ListAccountsQuerySchema = z.object({
  includeArchived: BooleanQuery.default(false),
  type: AccountTypeSchema.optional(),
  balanceAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional(),
});

export type ListAccountsQuery = z.infer<typeof ListAccountsQuerySchema>;
