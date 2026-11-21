import { z } from 'zod';

export const InvestmentIdParamSchema = z.object({ id: z.string().cuid() });
export type InvestmentIdParam = z.infer<typeof InvestmentIdParamSchema>;
