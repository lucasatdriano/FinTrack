import { z } from 'zod';

export const TransactionIdParamSchema = z.object({ id: z.string().cuid() });
export type TransactionIdParam = z.infer<typeof TransactionIdParamSchema>;
