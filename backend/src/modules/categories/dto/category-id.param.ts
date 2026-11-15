import { z } from 'zod';

export const CategoryIdParamSchema = z.object({ id: z.string().cuid() });
export type CategoryIdParam = z.infer<typeof CategoryIdParamSchema>;
