import { Module } from '@nestjs/common';
import { RecurringTransactionsController } from './recurring-transactions.controller.js';
import { RecurringTransactionsService } from './recurring-transactions.service.js';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler.js';
import { BudgetsModule } from '../budgets/budgets.module.js';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), BudgetsModule],
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService, RecurringTransactionsScheduler],
  exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}
