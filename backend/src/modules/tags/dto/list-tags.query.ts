import { z } from 'zod';
import { BooleanQuery } from '../../../common/validations/boolean.schema.js';

export const ListTagsQuerySchema = z.object({
  search: z.string().trim().min(1).max(40).optional(),
  withUsage: BooleanQuery.default(false),
});

export type ListTagsQuery = z.infer<typeof ListTagsQuerySchema>;
