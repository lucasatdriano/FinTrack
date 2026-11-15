import { z } from 'zod';
import { CategoryTypeSchema } from './category-type.schema.js';

export const CreateCategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  type: CategoryTypeSchema,
  icon: z.string().trim().min(1).max(40).optional(),
  color: z
    .string()
    .regex(
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
      'Cor deve ser hex (#fff ou #ffffff)',
    )
    .optional(),
  parentId: z.string().cuid().optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
