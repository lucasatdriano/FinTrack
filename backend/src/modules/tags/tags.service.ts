import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateTagDto } from './dto/create-tag.dto.js';
import type { UpdateTagDto } from './dto/update-tag.dto.js';
import type { ListTagsQuery } from './dto/list-tags.query.js';

const TAG_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTagDto) {
    try {
      return await this.prisma.tag.create({
        data: { userId, name: dto.name },
        select: TAG_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma tag com esse nome');
      }
      throw err;
    }
  }

  async list(userId: string, query: ListTagsQuery) {
    const where: Prisma.TagWhereInput = {
      userId,
      ...(query.search
        ? {
            name: { contains: query.search.toLowerCase(), mode: 'insensitive' },
          }
        : {}),
    };

    if (!query.withUsage) {
      return this.prisma.tag.findMany({
        where,
        select: TAG_SELECT,
        orderBy: { name: 'asc' },
      });
    }

    const tags = await this.prisma.tag.findMany({
      where,
      select: {
        ...TAG_SELECT,
        _count: { select: { transactions: true } },
      },
      orderBy: { name: 'asc' },
    });

    return tags.map((t) => ({
      ...t,
      transactionCount: t._count.transactions,
    }));
  }

  async findOne(userId: string, tagId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, userId },
      select: {
        ...TAG_SELECT,
        _count: { select: { transactions: true } },
      },
    });
    if (!tag) throw new NotFoundException('Tag não encontrada');
    return {
      ...tag,
      transactionCount: tag._count.transactions,
    };
  }

  async update(userId: string, tagId: string, dto: UpdateTagDto) {
    try {
      const result = await this.prisma.tag.updateMany({
        where: { id: tagId, userId },
        data: { name: dto.name },
      });

      if (result.count === 0) {
        throw new NotFoundException('Tag não encontrada');
      }

      return await this.prisma.tag.findFirstOrThrow({
        where: { id: tagId, userId },
        select: TAG_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma tag com esse nome');
      }
      throw err;
    }
  }

  async remove(userId: string, tagId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, userId },
      select: {
        id: true,
        name: true,
        _count: { select: { transactions: true } },
      },
    });

    if (!tag) throw new NotFoundException('Tag não encontrada');

    await this.prisma.tag.delete({ where: { id: tagId } });

    return {
      message: 'Tag excluída',
      affectedTransactions: tag._count.transactions,
    };
  }
}
