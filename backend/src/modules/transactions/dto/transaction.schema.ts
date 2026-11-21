import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);
