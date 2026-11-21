import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import { ImportsService } from './imports.service.js';
import type { AuthUser } from '../../types/auth.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  ListImportsQuerySchema,
  type ListImportsQuery,
} from './dto/list-imports.query.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

const UploadImportBodySchema = z.object({
  accountId: z.string().cuid(),
  format: z.enum(['CSV', 'OFX']),
  csvMapping: z.string().optional(),
});

const IdParamSchema = z.object({ id: z.string().cuid() });

@Controller('imports')
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(UploadImportBodySchema))
    body: z.infer<typeof UploadImportBodySchema>,
  ) {
    if (!file) throw new BadRequestException('Arquivo não enviado');

    let csvMapping;
    if (body.format === 'CSV') {
      if (!body.csvMapping) {
        throw new BadRequestException('csvMapping é obrigatório para CSV');
      }
      try {
        csvMapping = JSON.parse(body.csvMapping);
      } catch {
        throw new BadRequestException('csvMapping inválido (JSON malformado)');
      }
    }

    return this.imports.import(user.userId, {
      accountId: body.accountId,
      fileName: file.originalname,
      format: body.format,
      buffer: file.buffer,
      csvMapping,
    });
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListImportsQuerySchema))
    query: ListImportsQuery,
  ) {
    return this.imports.list(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(IdParamSchema)) { id }: { id: string },
  ) {
    return this.imports.findOne(user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(IdParamSchema)) { id }: { id: string },
  ) {
    return this.imports.remove(user.userId, id);
  }
}
