import { z } from 'zod';

export const AccountIdParamSchema = z.object({
  id: z.string().cuid(),
});

export type AccountIdParam = z.infer<typeof AccountIdParamSchema>;
