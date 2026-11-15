import { z } from 'zod';

export const TagIdParamSchema = z.object({ id: z.string().cuid() });
export type TagIdParam = z.infer<typeof TagIdParamSchema>;
