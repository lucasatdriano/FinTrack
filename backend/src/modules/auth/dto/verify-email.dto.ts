import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  token: z.string().min(32).max(128),
});

export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;
