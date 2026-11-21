import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { DueTransactionsScheduler } from './due-transactions.scheduler.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [ScheduleModule.forRoot(), MailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, DueTransactionsScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}
