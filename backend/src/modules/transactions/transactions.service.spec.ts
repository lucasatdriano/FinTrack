import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

const D = (v: number | string) => new Prisma.Decimal(v);

const USER = 'user_1';
const ACCOUNT_A = 'acc_a';
const ACCOUNT_B = 'acc_b';
const ACCOUNT_ARCHIVED = 'acc_archived';
const CAT_EXPENSE = 'cat_exp';
const CAT_INCOME = 'cat_inc';
const CAT_ARCHIVED = 'cat_arch';
const TAG_1 = 'tag_1';

function txExpense(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tx_1',
    type: 'EXPENSE',
    amount: D(42.9),
    description: 'Almoço',
    notes: null,
    date: new Date('2025-01-15T00:00:00Z'),
    isPaid: true,
    accountId: ACCOUNT_A,
    destinationAccountId: null,
    categoryId: CAT_EXPENSE,
    recurringId: null,
    installmentPlanId: null,
    installmentNumber: null,
    importBatchId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    account: { id: ACCOUNT_A, name: 'Nubank', type: 'CHECKING' },
    destinationAccount: null,
    category: {
      id: CAT_EXPENSE,
      name: 'Alimentação',
      type: 'EXPENSE',
      icon: null,
      color: null,
    },
    tags: [],
    ...overrides,
  };
}

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: {
    transaction: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    account: { findMany: ReturnType<typeof vi.fn> };
    category: { findFirst: ReturnType<typeof vi.fn> };
    tag: { count: ReturnType<typeof vi.fn> };
    transactionTag: { deleteMany: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      account: { findMany: vi.fn() },
      category: { findFirst: vi.fn() },
      tag: { count: vi.fn() },
      transactionTag: { deleteMany: vi.fn() },
      $transaction: vi.fn(),
    };

    prisma.$transaction.mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function')
        return (arg as (tx: typeof prisma) => unknown)(prisma);
      return Promise.all(arg as Promise<unknown>[]);
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(TransactionsService);
  });

  describe('create', () => {
    describe('invariantes de transferência', () => {
      it('rejeita TRANSFER sem destinationAccountId', async () => {
        await expect(
          service.create(USER, {
            type: 'TRANSFER',
            amount: 100,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('rejeita TRANSFER com origem = destino', async () => {
        await expect(
          service.create(USER, {
            type: 'TRANSFER',
            amount: 100,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            destinationAccountId: ACCOUNT_A,
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('rejeita TRANSFER com categoryId', async () => {
        await expect(
          service.create(USER, {
            type: 'TRANSFER',
            amount: 100,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            destinationAccountId: ACCOUNT_B,
            categoryId: CAT_EXPENSE,
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('aceita TRANSFER válida (sem categoria, com destino)', async () => {
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
          { id: ACCOUNT_B, archivedAt: null },
        ]);
        prisma.transaction.create.mockResolvedValue(
          txExpense({
            type: 'TRANSFER',
            accountId: ACCOUNT_A,
            destinationAccountId: ACCOUNT_B,
            categoryId: null,
          }),
        );

        const result = await service.create(USER, {
          type: 'TRANSFER',
          amount: 100,
          description: 'PIX',
          date: '2025-01-15',
          accountId: ACCOUNT_A,
          destinationAccountId: ACCOUNT_B,
          isPaid: true,
        });

        expect(result.type).toBe('TRANSFER');
      });

      it('rejeita destinationAccountId em INCOME/EXPENSE', async () => {
        await expect(
          service.create(USER, {
            type: 'EXPENSE',
            amount: 10,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            destinationAccountId: ACCOUNT_B,
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });
    });

    describe('validação de contas', () => {
      it('404 quando conta não existe', async () => {
        prisma.account.findMany.mockResolvedValue([]);
        await expect(
          service.create(USER, {
            type: 'EXPENSE',
            amount: 10,
            description: 'X',
            date: '2025-01-15',
            accountId: 'ghost',
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(NotFoundException);
      });

      it('rejeita conta arquivada', async () => {
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_ARCHIVED, archivedAt: new Date() },
        ]);
        await expect(
          service.create(USER, {
            type: 'EXPENSE',
            amount: 10,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_ARCHIVED,
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });
    });

    describe('validação de categoria', () => {
      beforeEach(() => {
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
        ]);
      });

      it('404 quando categoria não existe', async () => {
        prisma.category.findFirst.mockResolvedValue(null);
        await expect(
          service.create(USER, {
            type: 'EXPENSE',
            amount: 10,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            categoryId: 'ghost',
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(NotFoundException);
      });

      it('rejeita categoria arquivada', async () => {
        prisma.category.findFirst.mockResolvedValue({
          id: CAT_ARCHIVED,
          type: 'EXPENSE',
          archivedAt: new Date(),
        });
        await expect(
          service.create(USER, {
            type: 'EXPENSE',
            amount: 10,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            categoryId: CAT_ARCHIVED,
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('rejeita categoria EXPENSE em transação INCOME', async () => {
        prisma.category.findFirst.mockResolvedValue({
          id: CAT_EXPENSE,
          type: 'EXPENSE',
          archivedAt: null,
        });
        await expect(
          service.create(USER, {
            type: 'INCOME',
            amount: 10,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            categoryId: CAT_EXPENSE,
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });
    });

    describe('validação de tags', () => {
      beforeEach(() => {
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
        ]);
      });

      it('rejeita tag inexistente', async () => {
        prisma.tag.count.mockResolvedValue(0);
        await expect(
          service.create(USER, {
            type: 'EXPENSE',
            amount: 10,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            tagIds: [TAG_1],
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('aceita tag válida', async () => {
        prisma.tag.count.mockResolvedValue(1);
        prisma.transaction.create.mockResolvedValue(
          txExpense({ tags: [{ tag: { id: TAG_1, name: 'viagem' } }] }),
        );
        const result = await service.create(USER, {
          type: 'EXPENSE',
          amount: 10,
          description: 'X',
          date: '2025-01-15',
          accountId: ACCOUNT_A,
          tagIds: [TAG_1],
          isPaid: true,
        });
        expect(result.tags).toHaveLength(1);
      });
    });

    describe('erros do banco', () => {
      beforeEach(() => {
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
        ]);
      });

      it('P2003 → ConflictException', async () => {
        prisma.transaction.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('fk', {
            code: 'P2003',
            clientVersion: '7.10.1',
          }),
        );
        await expect(
          service.create(USER, {
            type: 'EXPENSE',
            amount: 10,
            description: 'X',
            date: '2025-01-15',
            accountId: ACCOUNT_A,
            isPaid: true,
          }),
        ).rejects.toBeInstanceOf(ConflictException);
      });
    });

    describe('caminho feliz', () => {
      it('cria EXPENSE com sucesso', async () => {
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
        ]);
        prisma.category.findFirst.mockResolvedValue({
          id: CAT_EXPENSE,
          type: 'EXPENSE',
          archivedAt: null,
        });
        prisma.transaction.create.mockResolvedValue(txExpense());

        const result = await service.create(USER, {
          type: 'EXPENSE',
          amount: 42.9,
          description: 'Almoço',
          date: '2025-01-15',
          accountId: ACCOUNT_A,
          categoryId: CAT_EXPENSE,
          isPaid: true,
        });

        expect(result.id).toBe('tx_1');
        expect(prisma.transaction.create).toHaveBeenCalledOnce();
      });
    });
  });

  describe('list', () => {
    it('aplica filtros (type, from/to, search)', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      await service.list(USER, {
        type: 'EXPENSE',
        from: '2025-01-01',
        to: '2025-01-31',
        search: 'almoço',
        orderBy: 'date',
        order: 'desc',
        page: 1,
        perPage: 20,
      });

      const [findArgs] = prisma.transaction.findMany.mock.calls[0];
      expect(findArgs.where).toMatchObject({
        userId: USER,
        type: 'EXPENSE',
        date: {
          gte: new Date('2025-01-01T00:00:00Z'),
          lte: new Date('2025-01-31T23:59:59.999Z'),
        },
        description: { contains: 'almoço', mode: 'insensitive' },
      });
      expect(findArgs.skip).toBe(0);
      expect(findArgs.take).toBe(20);
    });

    it('paginação correta na página 3', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      await service.list(USER, {
        orderBy: 'date',
        order: 'desc',
        page: 3,
        perPage: 50,
      });

      const [findArgs] = prisma.transaction.findMany.mock.calls[0];
      expect(findArgs.skip).toBe(100);
      expect(findArgs.take).toBe(50);
    });

    it('retorna paginação com totalPages', async () => {
      prisma.transaction.findMany.mockResolvedValue([txExpense()]);
      prisma.transaction.count.mockResolvedValue(42);

      const result = await service.list(USER, {
        orderBy: 'date',
        order: 'desc',
        page: 2,
        perPage: 20,
      });

      expect(result.pagination).toEqual({
        page: 2,
        perPage: 20,
        total: 42,
        totalPages: 3,
      });
    });

    it('isPaid=false filtra só pendentes', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      await service.list(USER, {
        isPaid: false,
        orderBy: 'date',
        order: 'desc',
        page: 1,
        perPage: 20,
      });

      const [findArgs] = prisma.transaction.findMany.mock.calls[0];
      expect(findArgs.where.isPaid).toBe(false);
    });
  });

  describe('findOne', () => {
    it('404 quando não existe', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);
      await expect(service.findOne(USER, 'ghost')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('retorna transação', async () => {
      prisma.transaction.findFirst.mockResolvedValue(txExpense());
      const result = await service.findOne(USER, 'tx_1');
      expect(result.id).toBe('tx_1');
    });
  });

  describe('update', () => {
    const currentExpense = {
      id: 'tx_1',
      type: 'EXPENSE' as const,
      accountId: ACCOUNT_A,
      destinationAccountId: null,
      categoryId: CAT_EXPENSE,
      recurringId: null,
      installmentPlanId: null,
    };

    it('404 quando não existe', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);
      await expect(
        service.update(USER, 'ghost', { amount: 10 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('bloqueia edição de transação gerada por recorrência', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...currentExpense,
        recurringId: 'rec_1',
      });
      await expect(
        service.update(USER, 'tx_1', { amount: 10 }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('bloqueia edição de transação gerada por parcelamento', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...currentExpense,
        installmentPlanId: 'plan_1',
      });
      await expect(
        service.update(USER, 'tx_1', { amount: 10 }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    describe('estado final (current + dto)', () => {
      it('EXPENSE → TRANSFER sem destinationAccountId → 400', async () => {
        prisma.transaction.findFirst.mockResolvedValue(currentExpense);
        await expect(
          service.update(USER, 'tx_1', { type: 'TRANSFER' }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('EXPENSE → TRANSFER mantendo categoryId → 400', async () => {
        prisma.transaction.findFirst.mockResolvedValue(currentExpense);
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
          { id: ACCOUNT_B, archivedAt: null },
        ]);
        await expect(
          service.update(USER, 'tx_1', {
            type: 'TRANSFER',
            destinationAccountId: ACCOUNT_B,
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('EXPENSE → TRANSFER limpando categoryId e setando destino → passa', async () => {
        prisma.transaction.findFirst.mockResolvedValue(currentExpense);
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
          { id: ACCOUNT_B, archivedAt: null },
        ]);
        prisma.transaction.update.mockResolvedValue(
          txExpense({
            type: 'TRANSFER',
            destinationAccountId: ACCOUNT_B,
            categoryId: null,
          }),
        );
        prisma.transactionTag.deleteMany.mockResolvedValue({ count: 0 });

        const result = await service.update(USER, 'tx_1', {
          type: 'TRANSFER',
          destinationAccountId: ACCOUNT_B,
          categoryId: null,
        });

        expect(result.type).toBe('TRANSFER');
      });

      it('rejeita troca de categoria pra tipo incompatível', async () => {
        prisma.transaction.findFirst.mockResolvedValue(currentExpense);
        prisma.category.findFirst.mockResolvedValue({
          id: CAT_INCOME,
          type: 'INCOME',
          archivedAt: null,
        });
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
        ]);

        await expect(
          service.update(USER, 'tx_1', { categoryId: CAT_INCOME }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });
    });

    describe('tags', () => {
      beforeEach(() => {
        prisma.transaction.findFirst.mockResolvedValue(currentExpense);
        prisma.account.findMany.mockResolvedValue([
          { id: ACCOUNT_A, archivedAt: null },
        ]);
        prisma.category.findFirst.mockResolvedValue({
          id: CAT_EXPENSE,
          type: 'EXPENSE',
          archivedAt: null,
        });
      });

      it('substitui todas as tags quando tagIds é enviado', async () => {
        prisma.tag.count.mockResolvedValue(1);
        prisma.transaction.update.mockResolvedValue(txExpense());
        prisma.transactionTag.deleteMany.mockResolvedValue({ count: 2 });

        await service.update(USER, 'tx_1', { tagIds: [TAG_1] });

        expect(prisma.transactionTag.deleteMany).toHaveBeenCalledWith({
          where: { transactionId: 'tx_1' },
        });
      });

      it('não mexe em tags quando tagIds não é enviado', async () => {
        prisma.transaction.update.mockResolvedValue(txExpense());

        await service.update(USER, 'tx_1', { amount: 50 });

        expect(prisma.transactionTag.deleteMany).not.toHaveBeenCalled();
      });
    });
  });

  describe('remove', () => {
    it('404 quando não existe', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);
      await expect(service.remove(USER, 'ghost')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('bloqueia delete de transação de recorrência', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx_1',
        recurringId: 'rec_1',
        installmentPlanId: null,
      });
      await expect(service.remove(USER, 'tx_1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.transaction.delete).not.toHaveBeenCalled();
    });

    it('bloqueia delete de transação de parcelamento', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx_1',
        recurringId: null,
        installmentPlanId: 'plan_1',
      });
      await expect(service.remove(USER, 'tx_1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('deleta transação normal', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx_1',
        recurringId: null,
        installmentPlanId: null,
      });
      prisma.transaction.delete.mockResolvedValue({});

      const result = await service.remove(USER, 'tx_1');
      expect(result.message).toMatch(/excluída/i);
      expect(prisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx_1' },
      });
    });
  });
});
