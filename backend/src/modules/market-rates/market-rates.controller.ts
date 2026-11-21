import { Controller, Get, Query } from '@nestjs/common';
import { MarketRatesService } from './market-rates.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  ListMarketRatesQuerySchema,
  type ListMarketRatesQuery,
} from './dto/list-market-rates.query.js';

@Controller('market-rates')
export class MarketRatesController {
  constructor(private readonly marketRatesService: MarketRatesService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(ListMarketRatesQuerySchema))
    query: ListMarketRatesQuery,
  ) {
    return this.marketRatesService.list(query);
  }
}
