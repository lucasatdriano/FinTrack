import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  CreateBudgetSchema,
  type CreateBudgetDto,
} from './dto/create-budget.dto.js';
import {
  UpdateBudgetSchema,
  type UpdateBudgetDto,
} from './dto/update-budget.dto.js';
import {
  ListBudgetsQuerySchema,
  type ListBudgetsQuery,
} from './dto/list-budgets.query.js';
import {
  CopyBudgetsSchema,
  type CopyBudgetsDto,
} from './dto/copy-budgets.dto.js';
import {
  BudgetIdParamSchema,
  type BudgetIdParam,
} from './dto/budget-id.param.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateBudgetSchema)) dto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(user.userId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListBudgetsQuerySchema))
    query: ListBudgetsQuery,
  ) {
    return this.budgetsService.list(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(BudgetIdParamSchema)) { id }: BudgetIdParam,
  ) {
    return this.budgetsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(BudgetIdParamSchema)) { id }: BudgetIdParam,
    @Body(new ZodValidationPipe(UpdateBudgetSchema)) dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(BudgetIdParamSchema)) { id }: BudgetIdParam,
  ) {
    return this.budgetsService.remove(user.userId, id);
  }

  @Post('copy-from-previous-month')
  @HttpCode(HttpStatus.OK)
  copyFromPreviousMonth(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CopyBudgetsSchema)) dto: CopyBudgetsDto,
  ) {
    return this.budgetsService.copyFromPreviousMonth(user.userId, dto);
  }
}
