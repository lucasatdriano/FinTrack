import { z } from 'zod';

export const UpdateSettingsSchema = z
  .object({
    currency: z.string().length(3).toUpperCase().optional(),
    locale: z.string().min(2).max(10).optional(),
    timezone: z.string().min(1).max(64).optional(),
    emailBudgetAlerts: z.boolean().optional(),
    emailMonthlySummary: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Envie pelo menos um campo para atualizar',
  });

export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;
