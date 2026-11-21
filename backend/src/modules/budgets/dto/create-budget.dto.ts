import { z } from 'zod';
import { MoneySchema } from '../../../common/validations/money.schema.js';

export const CreateBudgetSchema = z.object({
  categoryId: z.string().cuid(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  amount: MoneySchema.positive('Valor deve ser positivo'),
  alertThreshold: z.number().int().min(1).max(100).default(80),
});

export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;
