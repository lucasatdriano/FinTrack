import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller.js';
import { AccountsService } from './accounts.service.js';
import { AccountBalanceService } from './account-balance.service.js';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, AccountBalanceService],
  exports: [AccountsService, AccountBalanceService],
})
export class AccountsModule {}
