import { z } from 'zod';

export const CreateTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(40, 'Máximo 40 caracteres')
    .transform((v) => v.toLowerCase()),
});

export type CreateTagDto = z.infer<typeof CreateTagSchema>;
