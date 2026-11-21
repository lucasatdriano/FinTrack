import { z } from 'zod';

export const PhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ''))
  .transform((v) => (v.startsWith('+') ? v : `+${v}`))
  .refine((v) => /^\+[1-9]\d{7,14}$/.test(v), {
    message: 'Telefone inválido (formato E.164: +5511999999999)',
  });
