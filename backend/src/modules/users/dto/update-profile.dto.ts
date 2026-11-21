import { z } from 'zod';
import { PhoneSchema } from '../../../common/validations/phone.schema.js';

export const UpdateProfileSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    email: z.email().toLowerCase().optional(),
    phone: PhoneSchema.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Envie pelo menos um campo para atualizar',
  });

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
