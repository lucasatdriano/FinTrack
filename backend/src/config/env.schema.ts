import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().default(3001),

    DATABASE_URL: z.url(),
    API_URL: z.url(),
    FRONT_URL: z.url(),

    COOKIE_SECRET: z
      .string()
      .min(32, 'COOKIE_SECRET precisa ter no mínimo 32 caracteres'),
    JWT_ACCESS_SECRET: z
      .string()
      .min(32, 'JWT_ACCESS_SECRET precisa ter no mínimo 32 caracteres'),
    JWT_ACCESS_EXPIRES_IN: z
      .string()
      .regex(/^\d+[smhd]$/)
      .default('15m'),

    INTERNAL_API_SECRET: z
      .string()
      .min(32, 'INTERNAL_API_SECRET precisa ter no mínimo 32 caracteres'),
    CRON_SECRET: z
      .string()
      .min(32, 'CRON_SECRET precisa ter no mínimo 32 caracteres'),

    RESEND_API_KEY: z.string().optional(),
    MAIL_FROM: z.string().default('FinTrack <no-reply@fintrack.app>'),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        return !!data.RESEND_API_KEY;
      }
      return true;
    },
    {
      message: 'RESEND_API_KEY é obrigatória em produção',
      path: ['RESEND_API_KEY'],
    },
  );

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Variáveis de ambiente inválidas:\n${details}`);
  }
  return result.data;
}
