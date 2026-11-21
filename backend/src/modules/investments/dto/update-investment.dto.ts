import { z } from 'zod';

export const UpdateInvestmentSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    institution: z.string().trim().min(1).max(80).nullable().optional(),
    ticker: z.string().trim().min(1).max(20).nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    currentValue: z.number().nonnegative().multipleOf(0.01).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Envie pelo menos um campo',
  });

export type UpdateInvestmentDto = z.infer<typeof UpdateInvestmentSchema>;
