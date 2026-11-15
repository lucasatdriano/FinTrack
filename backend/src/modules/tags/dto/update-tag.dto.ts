import { z } from 'zod';

export const UpdateTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .transform((v) => v.toLowerCase()),
});

export type UpdateTagDto = z.infer<typeof UpdateTagSchema>;
