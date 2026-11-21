import { z } from 'zod';

export const RecurringIdParamSchema = z.object({ id: z.string().cuid() });
export type RecurringIdParam = z.infer<typeof RecurringIdParamSchema>;
