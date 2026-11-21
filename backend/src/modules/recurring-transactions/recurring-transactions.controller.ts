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
import { RecurringTransactionsService } from './recurring-transactions.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  CreateRecurringSchema,
  type CreateRecurringDto,
} from './dto/create-recurring.dto.js';
import {
  UpdateRecurringSchema,
  type UpdateRecurringDto,
} from './dto/update-recurring.dto.js';
import {
  ListRecurringQuerySchema,
  type ListRecurringQuery,
} from './dto/list-recurring.query.js';
import {
  RecurringIdParamSchema,
  type RecurringIdParam,
} from './dto/recurring-id.param.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateRecurringSchema)) dto: CreateRecurringDto,
  ) {
    return this.recurringTransactionsService.create(user.userId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListRecurringQuerySchema))
    query: ListRecurringQuery,
  ) {
    return this.recurringTransactionsService.list(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(RecurringIdParamSchema))
    { id }: RecurringIdParam,
  ) {
    return this.recurringTransactionsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(RecurringIdParamSchema))
    { id }: RecurringIdParam,
    @Body(new ZodValidationPipe(UpdateRecurringSchema)) dto: UpdateRecurringDto,
  ) {
    return this.recurringTransactionsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(RecurringIdParamSchema))
    { id }: RecurringIdParam,
  ) {
    return this.recurringTransactionsService.remove(user.userId, id);
  }
}
