import { z } from 'zod';

export const ListMarketRatesQuerySchema = z.object({
  indicator: z.enum(['CDI', 'SELIC', 'IPCA', 'BTC_BRL', 'USD_BRL']).optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type ListMarketRatesQuery = z.infer<typeof ListMarketRatesQuerySchema>;
