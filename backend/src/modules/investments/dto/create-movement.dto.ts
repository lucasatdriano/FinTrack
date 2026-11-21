import { z } from 'zod';

const MoneySchema = z.number().positive().multipleOf(0.01).max(999_999_999.99);
const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const CreateMovementSchema = z.object({
  type: z.enum(['APPLICATION', 'REDEMPTION', 'YIELD', 'DIVIDEND']),
  amount: MoneySchema,
  quantity: z.number().positive().optional(),
  date: DateOnlySchema,
  notes: z.string().trim().max(500).optional(),
});

export type CreateMovementDto = z.infer<typeof CreateMovementSchema>;
