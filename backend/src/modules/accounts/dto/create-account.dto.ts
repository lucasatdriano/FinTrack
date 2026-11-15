import { z } from 'zod';
import { AccountTypeSchema } from './account.schema.js';
import { MoneySchema } from '../../../common/validations/money.js';

export const CreateAccountSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    bankName: z.string().trim().min(1).max(80).optional(),
    type: AccountTypeSchema,
    initialBalance: MoneySchema.default(0),
    color: z
      .string()
      .regex(
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
        'Cor deve ser hex (#fff ou #ffffff)',
      )
      .optional(),
    icon: z.string().trim().min(1).max(40).optional(),
    creditLimit: MoneySchema.positive().optional(),
    closingDay: z.number().int().min(1).max(31).optional(),
    dueDay: z.number().int().min(1).max(31).optional(),
  })
  .superRefine((data, ctx) => {
    const isCard = data.type === 'CREDIT_CARD';

    if (isCard) {
      if (data.creditLimit === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['creditLimit'],
          message: 'Cartão de crédito exige creditLimit',
        });
      }
      if (data.closingDay === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['closingDay'],
          message: 'Cartão de crédito exige closingDay',
        });
      }
      if (data.dueDay === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['dueDay'],
          message: 'Cartão de crédito exige dueDay',
        });
      }
    } else {
      if (
        data.creditLimit !== undefined ||
        data.closingDay !== undefined ||
        data.dueDay !== undefined
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'creditLimit/closingDay/dueDay só valem para CREDIT_CARD',
        });
      }
    }
  });

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
