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
import { TagsService } from './tags.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CreateTagSchema, type CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagSchema, type UpdateTagDto } from './dto/update-tag.dto.js';
import {
  ListTagsQuerySchema,
  type ListTagsQuery,
} from './dto/list-tags.query.js';
import { TagIdParamSchema, type TagIdParam } from './dto/tag-id.param.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateTagSchema)) dto: CreateTagDto,
  ) {
    return this.tagsService.create(user.userId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListTagsQuerySchema)) query: ListTagsQuery,
  ) {
    return this.tagsService.list(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(TagIdParamSchema)) { id }: TagIdParam,
  ) {
    return this.tagsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(TagIdParamSchema)) { id }: TagIdParam,
    @Body(new ZodValidationPipe(UpdateTagSchema)) dto: UpdateTagDto,
  ) {
    return this.tagsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(TagIdParamSchema)) { id }: TagIdParam,
  ) {
    return this.tagsService.remove(user.userId, id);
  }
}
