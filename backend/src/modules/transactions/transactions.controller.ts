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
import { TransactionsService } from './transactions.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  CreateTransactionSchema,
  type CreateTransactionDto,
} from './dto/create-transaction.dto.js';
import {
  UpdateTransactionSchema,
  type UpdateTransactionDto,
} from './dto/update-transaction.dto.js';
import {
  ListTransactionsQuerySchema,
  type ListTransactionsQuery,
} from './dto/list-transactions.query.js';
import {
  TransactionIdParamSchema,
  type TransactionIdParam,
} from './dto/transaction-id.param.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateTransactionSchema))
    dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user.userId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListTransactionsQuerySchema))
    query: ListTransactionsQuery,
  ) {
    return this.transactionsService.list(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(TransactionIdParamSchema))
    { id }: TransactionIdParam,
  ) {
    return this.transactionsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(TransactionIdParamSchema))
    { id }: TransactionIdParam,
    @Body(new ZodValidationPipe(UpdateTransactionSchema))
    dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(TransactionIdParamSchema))
    { id }: TransactionIdParam,
  ) {
    return this.transactionsService.remove(user.userId, id);
  }
}
