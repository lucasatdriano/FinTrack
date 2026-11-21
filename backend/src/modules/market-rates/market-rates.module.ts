import { Module } from '@nestjs/common';
import { MarketRatesController } from './market-rates.controller.js';
import { MarketRatesService } from './market-rates.service.js';
import { MarketRatesScheduler } from './market-rates.scheduler.js';
import { BcbProvider } from './providers/bcb.provider.js';
import { AwesomeApiProvider } from './providers/awesome-api.provider.js';
import { CoinGeckoProvider } from './providers/coingecko.provider.js';

@Module({
  controllers: [MarketRatesController],
  providers: [
    MarketRatesService,
    MarketRatesScheduler,
    BcbProvider,
    AwesomeApiProvider,
    CoinGeckoProvider,
  ],
  exports: [MarketRatesService],
})
export class MarketRatesModule {}
