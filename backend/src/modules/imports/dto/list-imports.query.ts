import { z } from 'zod';

export const ListImportsQuerySchema = z.object({
  accountId: z.string().cuid().optional(),
  format: z.enum(['CSV', 'OFX']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListImportsQuery = z.infer<typeof ListImportsQuerySchema>;
