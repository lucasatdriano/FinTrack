import { z } from 'zod';

/**
 * `asOf` (opcional): data de referência pro "hoje" (YYYY-MM-DD).
 * Se ausente, usa a data atual no timezone do usuário.
 * Útil pra testes determinísticos e pra "ver o mês passado como se fosse hoje".
 */
export const SummaryQuerySchema = z.object({
  asOf: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional(),
});

export type SummaryQuery = z.infer<typeof SummaryQuerySchema>;
