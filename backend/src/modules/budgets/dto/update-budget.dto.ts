import { z } from 'zod';
import { MoneySchema } from '../../../common/validations/money.schema.js';

export const UpdateBudgetSchema = z
  .object({
    amount: MoneySchema.positive('Valor deve ser positivo').optional(),
    alertThreshold: z.number().int().min(1).max(100).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Envie pelo menos um campo',
  });

export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;
