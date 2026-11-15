import { z } from 'zod';

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .max(72)
      .regex(/[A-Z]/, 'Precisa de uma letra maiúscula')
      .regex(/[a-z]/, 'Precisa de uma letra minúscula')
      .regex(/\d/, 'Precisa de um número'),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  });

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
