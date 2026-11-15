import { z } from 'zod';

export const CategoryTypeSchema = z.enum(['INCOME', 'EXPENSE']);
export type CategoryType = z.infer<typeof CategoryTypeSchema>;
