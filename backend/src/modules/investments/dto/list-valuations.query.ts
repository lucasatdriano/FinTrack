import { z } from 'zod';

export const ListValuationsQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type ListValuationsQuery = z.infer<typeof ListValuationsQuerySchema>;
