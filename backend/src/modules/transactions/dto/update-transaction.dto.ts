import { z } from 'zod';
import { MoneySchema } from '../../../common/validations/money.schema.js';
import { TransactionTypeSchema } from './transaction.schema.js';
import { DateOnlySchema } from '../../../common/validations/date.schema.js';

export const UpdateTransactionSchema = z
  .object({
    type: TransactionTypeSchema.optional(),
    amount: MoneySchema.positive('Valor deve ser positivo').optional(),
    description: z.string().trim().min(1).max(120).optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    date: DateOnlySchema.optional(),
    isPaid: z.boolean().optional(),
    accountId: z.string().cuid().optional(),
    destinationAccountId: z.string().cuid().nullable().optional(),
    categoryId: z.string().cuid().nullable().optional(),
    tagIds: z.array(z.string().cuid()).max(10).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Envie pelo menos um campo',
  });

export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
