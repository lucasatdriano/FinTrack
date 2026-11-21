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
import { InvestmentsService } from './investments.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  CreateInvestmentSchema,
  type CreateInvestmentDto,
} from './dto/create-investment.dto.js';
import {
  UpdateInvestmentSchema,
  type UpdateInvestmentDto,
} from './dto/update-investment.dto.js';
import {
  ListInvestmentsQuerySchema,
  type ListInvestmentsQuery,
} from './dto/list-investments.query.js';
import {
  CreateMovementSchema,
  type CreateMovementDto,
} from './dto/create-movement.dto.js';
import {
  ListValuationsQuerySchema,
  type ListValuationsQuery,
} from './dto/list-valuations.query.js';
import {
  InvestmentIdParamSchema,
  type InvestmentIdParam,
} from './dto/investment-id.param.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investments: InvestmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateInvestmentSchema))
    dto: CreateInvestmentDto,
  ) {
    return this.investments.create(user.userId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListInvestmentsQuerySchema))
    query: ListInvestmentsQuery,
  ) {
    return this.investments.list(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(InvestmentIdParamSchema))
    { id }: InvestmentIdParam,
  ) {
    return this.investments.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(InvestmentIdParamSchema))
    { id }: InvestmentIdParam,
    @Body(new ZodValidationPipe(UpdateInvestmentSchema))
    dto: UpdateInvestmentDto,
  ) {
    return this.investments.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(InvestmentIdParamSchema))
    { id }: InvestmentIdParam,
  ) {
    return this.investments.remove(user.userId, id);
  }

  @Post(':id/movements')
  @HttpCode(HttpStatus.CREATED)
  addMovement(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(InvestmentIdParamSchema))
    { id }: InvestmentIdParam,
    @Body(new ZodValidationPipe(CreateMovementSchema)) dto: CreateMovementDto,
  ) {
    return this.investments.addMovement(user.userId, id, dto);
  }

  @Get(':id/movements')
  listMovements(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(InvestmentIdParamSchema))
    { id }: InvestmentIdParam,
  ) {
    return this.investments.listMovements(user.userId, id);
  }

  @Get(':id/valuations')
  listValuations(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(InvestmentIdParamSchema))
    { id }: InvestmentIdParam,
    @Query(new ZodValidationPipe(ListValuationsQuerySchema))
    query: ListValuationsQuery,
  ) {
    return this.investments.listValuations(
      user.userId,
      id,
      query.from,
      query.to,
    );
  }

  @Post(':id/revaluate')
  @HttpCode(HttpStatus.OK)
  revaluate(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(InvestmentIdParamSchema))
    { id }: InvestmentIdParam,
  ) {
    return this.investments.revaluate(user.userId, id);
  }
}
