import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InvestmentsController } from './investments.controller.js';
import { InvestmentsService } from './investments.service.js';
import { InvestmentsCalculatorService } from './investments-calculator.service.js';
import { MarketRatesModule } from '../market-rates/market-rates.module.js';
import { InvestmentsValuationScheduler } from './investment-valuation.scheduler.js';

@Module({
  imports: [ScheduleModule.forRoot(), MarketRatesModule],
  controllers: [InvestmentsController],
  providers: [
    InvestmentsService,
    InvestmentsCalculatorService,
    InvestmentsValuationScheduler,
  ],
  exports: [InvestmentsService, InvestmentsCalculatorService],
})
export class InvestmentsModule {}
