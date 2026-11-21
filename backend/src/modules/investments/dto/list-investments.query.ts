import { z } from 'zod';

export const ListInvestmentsQuerySchema = z.object({
  type: z
    .enum([
      'CDB',
      'LCI',
      'LCA',
      'TESOURO_SELIC',
      'TESOURO_IPCA',
      'TESOURO_PREFIXADO',
      'STOCK',
      'FII',
      'CRYPTO',
      'OTHER',
    ])
    .optional(),
  status: z.enum(['ACTIVE', 'REDEEMED']).optional(),
  accountId: z.string().cuid().optional(),
});

export type ListInvestmentsQuery = z.infer<typeof ListInvestmentsQuerySchema>;
