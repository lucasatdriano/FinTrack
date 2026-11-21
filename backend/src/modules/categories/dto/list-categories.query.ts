import { z } from 'zod';
import { CategoryTypeSchema } from './category-type.schema.js';
import { BooleanQuery } from '../../../common/validations/boolean.schema.js';

export const ListCategoriesQuerySchema = z.object({
  includeArchived: BooleanQuery.default(false),
  type: CategoryTypeSchema.optional(),
  format: z.enum(['flat', 'tree']).default('flat'),
});

export type ListCategoriesQuery = z.infer<typeof ListCategoriesQuerySchema>;
