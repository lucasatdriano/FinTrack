import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';
import type { ListCategoriesQuery } from './dto/list-categories.query.js';
import { DEFAULT_CATEGORIES } from './default-categories.js';

const CATEGORY_SELECT = {
  id: true,
  name: true,
  type: true,
  icon: true,
  color: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDefaults(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<void> {
    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({
        userId,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
      })),
    });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          userId,
          name: dto.name,
          type: dto.type,
          icon: dto.icon,
          color: dto.color,
        },
        select: CATEGORY_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe uma categoria com esse nome nesse tipo',
        );
      }
      throw err;
    }
  }

  async list(userId: string, query: ListCategoriesQuery) {
    return this.prisma.category.findMany({
      where: {
        userId,
        ...(query.includeArchived ? {} : { archivedAt: null }),
        ...(query.type ? { type: query.type } : {}),
      },
      select: CATEGORY_SELECT,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
      select: {
        ...CATEGORY_SELECT,
        _count: { select: { transactions: true, budgets: true } },
      },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  async update(userId: string, categoryId: string, dto: UpdateCategoryDto) {
    const current = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
      select: {
        id: true,
        type: true,
        _count: { select: { transactions: true, budgets: true } },
      },
    });
    if (!current) throw new NotFoundException('Categoria não encontrada');

    if (dto.type && dto.type !== current.type) {
      if (current._count.transactions > 0 || current._count.budgets > 0) {
        throw new ConflictException(
          'Não é possível mudar o tipo: categoria possui transações ou orçamentos',
        );
      }
    }

    try {
      return await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.icon !== undefined && { icon: dto.icon }),
          ...(dto.color !== undefined && { color: dto.color }),
        },
        select: CATEGORY_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe uma categoria com esse nome nesse tipo',
        );
      }
      throw err;
    }
  }

  async archive(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
      select: { id: true, archivedAt: true },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (category.archivedAt) return { message: 'Categoria já arquivada' };

    await this.prisma.category.update({
      where: { id: categoryId },
      data: { archivedAt: new Date() },
    });
    return { message: 'Categoria arquivada' };
  }

  async unarchive(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
      select: { id: true, archivedAt: true },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (!category.archivedAt) return { message: 'Categoria já está ativa' };

    await this.prisma.category.update({
      where: { id: categoryId },
      data: { archivedAt: null },
    });
    return { message: 'Categoria reativada' };
  }

  async remove(userId: string, categoryId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const category = await tx.category.findFirst({
          where: { id: categoryId, userId },
          select: {
            id: true,
            _count: { select: { transactions: true, budgets: true } },
          },
        });
        if (!category) throw new NotFoundException('Categoria não encontrada');

        const c = category._count;
        if (c.transactions > 0 || c.budgets > 0) {
          throw new ConflictException(
            'Categoria possui histórico. Arquive em vez de excluir.',
          );
        }

        await tx.category.delete({ where: { id: categoryId } });
        return { message: 'Categoria excluída' };
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'Categoria possui histórico. Arquive em vez de excluir.',
        );
      }
      throw err;
    }
  }
}
