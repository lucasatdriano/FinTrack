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
import { AccountsService } from './accounts.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  CreateAccountSchema,
  type CreateAccountDto,
} from './dto/create-account.dto.js';
import {
  UpdateAccountSchema,
  type UpdateAccountDto,
} from './dto/update-account.dto.js';
import {
  ListAccountsQuerySchema,
  type ListAccountsQuery,
} from './dto/list-accounts.query.js';
import {
  AccountIdParamSchema,
  type AccountIdParam,
} from './dto/account-id.param.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateAccountSchema)) dto: CreateAccountDto,
  ) {
    return this.accountsService.create(user.userId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListAccountsQuerySchema))
    query: ListAccountsQuery,
  ) {
    return this.accountsService.list(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(AccountIdParamSchema)) { id }: AccountIdParam,
    @Query('balanceAt') balanceAt?: string,
  ) {
    return this.accountsService.findOne(user.userId, id, balanceAt);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(AccountIdParamSchema)) { id }: AccountIdParam,
    @Body(new ZodValidationPipe(UpdateAccountSchema)) dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(user.userId, id, dto);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(AccountIdParamSchema)) { id }: AccountIdParam,
  ) {
    return this.accountsService.archive(user.userId, id);
  }

  @Post(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  unarchive(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(AccountIdParamSchema)) { id }: AccountIdParam,
  ) {
    return this.accountsService.unarchive(user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(AccountIdParamSchema)) { id }: AccountIdParam,
  ) {
    return this.accountsService.remove(user.userId, id);
  }
}
