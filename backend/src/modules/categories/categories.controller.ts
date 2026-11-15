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
import { CategoriesService } from './categories.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  CreateCategorySchema,
  type CreateCategoryDto,
} from './dto/create-category.dto.js';
import {
  UpdateCategorySchema,
  type UpdateCategoryDto,
} from './dto/update-category.dto.js';
import {
  ListCategoriesQuerySchema,
  type ListCategoriesQuery,
} from './dto/list-categories.query.js';
import {
  CategoryIdParamSchema,
  type CategoryIdParam,
} from './dto/category-id.param.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateCategorySchema)) dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.userId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListCategoriesQuerySchema))
    query: ListCategoriesQuery,
  ) {
    return this.categoriesService.list(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(CategoryIdParamSchema))
    { id }: CategoryIdParam,
  ) {
    return this.categoriesService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(CategoryIdParamSchema))
    { id }: CategoryIdParam,
    @Body(new ZodValidationPipe(UpdateCategorySchema)) dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.userId, id, dto);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(CategoryIdParamSchema))
    { id }: CategoryIdParam,
  ) {
    return this.categoriesService.archive(user.userId, id);
  }

  @Post(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  unarchive(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(CategoryIdParamSchema))
    { id }: CategoryIdParam,
  ) {
    return this.categoriesService.unarchive(user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(CategoryIdParamSchema))
    { id }: CategoryIdParam,
  ) {
    return this.categoriesService.remove(user.userId, id);
  }
}
