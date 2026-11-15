import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { SummaryQuerySchema, type SummaryQuery } from './dto/summary.query.js';
import {
  MonthlyEvolutionQuerySchema,
  type MonthlyEvolutionQuery,
} from './dto/monthly-evolution.query.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(SummaryQuerySchema)) query: SummaryQuery,
  ) {
    return this.dashboardService.summary(user.userId, query);
  }

  @Get('monthly-evolution')
  monthlyEvolution(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(MonthlyEvolutionQuerySchema))
    query: MonthlyEvolutionQuery,
  ) {
    return this.dashboardService.monthlyEvolution(user.userId, query);
  }
}
