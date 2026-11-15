import { z } from 'zod';
import { AccountTypeSchema } from './account.schema.js';

export const ListAccountsQuerySchema = z.object({
  includeArchived: z.coerce.boolean().default(false),
  type: AccountTypeSchema.optional(),
  balanceAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional(),
});

export type ListAccountsQuery = z.infer<typeof ListAccountsQuerySchema>;
