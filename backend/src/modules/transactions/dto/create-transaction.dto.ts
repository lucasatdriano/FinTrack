import { z } from 'zod';
import { MoneySchema } from '../../../common/validations/money.js';
import { DateOnlySchema, TransactionTypeSchema } from './transaction.schema.js';

export const CreateTransactionSchema = z
  .object({
    type: TransactionTypeSchema,
    amount: MoneySchema.positive('Valor deve ser positivo'),
    description: z.string().trim().min(1).max(120),
    notes: z.string().trim().max(500).optional(),
    date: DateOnlySchema,
    isPaid: z.boolean().default(true),
    accountId: z.string().cuid(),
    destinationAccountId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
    tagIds: z.array(z.string().cuid()).max(10).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'TRANSFER') {
      if (!data.destinationAccountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['destinationAccountId'],
          message: 'Transferência exige destinationAccountId',
        });
      }
      if (data.destinationAccountId === data.accountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['destinationAccountId'],
          message: 'Conta de origem e destino devem ser diferentes',
        });
      }
      if (data.categoryId) {
        ctx.addIssue({
          code: 'custom',
          path: ['categoryId'],
          message: 'Transferência não tem categoria',
        });
      }
    } else {
      if (data.destinationAccountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['destinationAccountId'],
          message: 'destinationAccountId só é permitido em TRANSFER',
        });
      }
    }
  });

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
