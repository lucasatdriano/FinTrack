import { z } from 'zod';

export const DeleteAccountSchema = z.object({
  password: z.string().min(1, 'Confirme com sua senha'),
});

export type DeleteAccountDto = z.infer<typeof DeleteAccountSchema>;
