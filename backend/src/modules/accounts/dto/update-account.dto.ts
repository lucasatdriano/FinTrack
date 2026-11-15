import { z } from 'zod';
import { AccountTypeSchema } from './account.schema.js';
import { MoneySchema } from '../../../common/validations/money.js';

export const UpdateAccountSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    bankName: z.string().trim().min(1).max(80).nullable().optional(),
    type: AccountTypeSchema.optional(),
    initialBalance: MoneySchema.optional(),
    color: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .nullable()
      .optional(),
    icon: z.string().trim().min(1).max(40).nullable().optional(),
    creditLimit: MoneySchema.positive().nullable().optional(),
    closingDay: z.number().int().min(1).max(31).nullable().optional(),
    dueDay: z.number().int().min(1).max(31).nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Envie pelo menos um campo',
  });

export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
