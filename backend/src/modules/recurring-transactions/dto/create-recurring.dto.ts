import { z } from 'zod';
import { MoneySchema } from '../../../common/validations/money.schema.js';
import { DateOnlySchema } from '../../../common/validations/date.schema.js';

export const CreateRecurringSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    amount: MoneySchema.positive('Valor deve ser positivo'),
    description: z.string().trim().min(1).max(120),
    accountId: z.string().cuid(),
    destinationAccountId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
    interval: z.number().int().min(1).default(1),
    startDate: DateOnlySchema,
    endDate: DateOnlySchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'TRANSFER') {
      if (!data.destinationAccountId)
        ctx.addIssue({
          code: 'custom',
          path: ['destinationAccountId'],
          message: 'Transferência exige destino',
        });
      if (data.destinationAccountId === data.accountId)
        ctx.addIssue({
          code: 'custom',
          path: ['destinationAccountId'],
          message: 'Destino deve ser diferente da origem',
        });
      if (data.categoryId)
        ctx.addIssue({
          code: 'custom',
          path: ['categoryId'],
          message: 'Transferência não tem categoria',
        });
    } else {
      if (data.destinationAccountId)
        ctx.addIssue({
          code: 'custom',
          path: ['destinationAccountId'],
          message: 'Só permitido em TRANSFER',
        });
    }

    if (data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Data final deve ser após a inicial',
      });
    }
  });

export type CreateRecurringDto = z.infer<typeof CreateRecurringSchema>;
