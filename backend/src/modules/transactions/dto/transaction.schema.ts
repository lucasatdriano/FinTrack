import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);

export const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), {
    message: 'Data inválida',
  });
