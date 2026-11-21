import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller.js';
import { BudgetsService } from './budgets.service.js';
import { BudgetAlertsService } from './budget-alerts.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [BudgetsController],
  providers: [BudgetsService, BudgetAlertsService],
  exports: [BudgetsService, BudgetAlertsService],
})
export class BudgetsModule {}
