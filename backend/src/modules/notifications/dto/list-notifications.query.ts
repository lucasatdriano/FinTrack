import { z } from 'zod';
import { BooleanQuery } from '../../../common/validations/boolean.schema.js';

export const ListNotificationsQuerySchema = z.object({
  unreadOnly: BooleanQuery.default(false),
  type: z
    .enum([
      'BUDGET_ALERT',
      'BUDGET_EXCEEDED',
      'RECURRING_CREATED',
      'IMPORT_FINISHED',
      'TRANSACTION_DUE_SOON',
      'TRANSACTION_OVERDUE',
      'SYSTEM',
    ])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListNotificationsQuery = z.infer<
  typeof ListNotificationsQuerySchema
>;
