import { z } from 'zod';
import { CategoryTypeSchema } from './category-type.schema.js';

export const ListCategoriesQuerySchema = z.object({
  includeArchived: z.coerce.boolean().default(false),
  type: CategoryTypeSchema.optional(),
  /**
   * flat (default): lista plana com parentId pra o front montar
   * tree: aninhada em children[]
   */
  format: z.enum(['flat', 'tree']).default('flat'),
});

export type ListCategoriesQuery = z.infer<typeof ListCategoriesQuerySchema>;
