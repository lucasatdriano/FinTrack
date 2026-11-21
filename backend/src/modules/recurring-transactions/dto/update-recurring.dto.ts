import { z } from 'zod';
import { MoneySchema } from '../../../common/validations/money.schema.js';
import { DateOnlySchema } from '../../../common/validations/date.schema.js';

export const UpdateRecurringSchema = z
  .object({
    amount: MoneySchema.positive('Valor deve ser positivo').optional(),
    description: z.string().trim().min(1).max(120).optional(),
    isActive: z.boolean().optional(),
    endDate: DateOnlySchema.nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Envie pelo menos um campo',
  });

export type UpdateRecurringDto = z.infer<typeof UpdateRecurringSchema>;
