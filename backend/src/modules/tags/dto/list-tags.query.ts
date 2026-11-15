import { z } from 'zod';

export const ListTagsQuerySchema = z.object({
  search: z.string().trim().min(1).max(40).optional(),
  withUsage: z.coerce.boolean().default(false),
});

export type ListTagsQuery = z.infer<typeof ListTagsQuerySchema>;
