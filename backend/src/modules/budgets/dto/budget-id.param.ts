import { z } from 'zod';

export const BudgetIdParamSchema = z.object({ id: z.string().cuid() });
export type BudgetIdParam = z.infer<typeof BudgetIdParamSchema>;
