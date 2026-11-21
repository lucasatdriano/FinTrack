import { z } from 'zod';

export const NotificationIdParamSchema = z.object({ id: z.string().cuid() });
export type NotificationIdParam = z.infer<typeof NotificationIdParamSchema>;
