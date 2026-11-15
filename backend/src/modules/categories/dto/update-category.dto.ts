import { z } from 'zod';
import { CategoryTypeSchema } from './category-type.schema.js';

export const UpdateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(60).optional(),
    type: CategoryTypeSchema.optional(),
    icon: z.string().trim().min(1).max(40).nullable().optional(),
    color: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .nullable()
      .optional(),
    parentId: z.string().cuid().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Envie pelo menos um campo',
  });

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
