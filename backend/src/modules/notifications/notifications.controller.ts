import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  ListNotificationsQuerySchema,
  type ListNotificationsQuery,
} from './dto/list-notifications.query.js';
import {
  NotificationIdParamSchema,
  type NotificationIdParam,
} from './dto/notification-id.param.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListNotificationsQuerySchema))
    query: ListNotificationsQuery,
  ) {
    return this.notifications.list(user.userId, query);
  }

  @Get('unread-count')
  countUnread(@CurrentUser() user: AuthUser) {
    return this.notifications.countUnread(user.userId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(NotificationIdParamSchema))
    { id }: NotificationIdParam,
  ) {
    return this.notifications.markAsRead(user.userId, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@CurrentUser() user: AuthUser) {
    return this.notifications.markAllAsRead(user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(NotificationIdParamSchema))
    { id }: NotificationIdParam,
  ) {
    return this.notifications.remove(user.userId, id);
  }
}
