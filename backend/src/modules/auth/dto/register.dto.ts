import { z } from 'zod';
import { PhoneSchema } from '../../../common/validations/phone.js';

export const RegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email().toLowerCase(),
  phone: PhoneSchema,
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(72, 'Máximo 72 caracteres')
    .regex(/[A-Z]/, 'Precisa de uma letra maiúscula')
    .regex(/[a-z]/, 'Precisa de uma letra minúscula')
    .regex(/\d/, 'Precisa de um número'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
