import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  token: z.string().min(32),
  newPassword: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
