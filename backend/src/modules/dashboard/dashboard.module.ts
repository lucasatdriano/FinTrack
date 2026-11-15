import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { AccountsModule } from '../accounts/accounts.module.js';

@Module({
  imports: [AccountsModule], // pra usar AccountBalanceService
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
