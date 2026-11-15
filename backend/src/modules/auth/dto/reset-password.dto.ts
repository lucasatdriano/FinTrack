import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  token: z.string().min(32).max(128),
  newPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(72)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
