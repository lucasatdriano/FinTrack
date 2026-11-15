import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { AccountBalanceService } from './account-balance.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

const D = (v: number | string) => new Prisma.Decimal(v);

function buildAccount(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'acc_1',
    name: 'Nubank',
    bankName: 'Nubank',
    type: 'CHECKING',
    initialBalance: D(100),
    color: null,
    icon: null,
    creditLimit: null,
    closingDay: null,
    dueDay: null,
    archivedAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  };
}

describe('AccountsService', () => {
  let service: AccountsService;
  let prisma: {
    account: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findUniqueOrThrow: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
  let balance: {
    computeBalances: ReturnType<typeof vi.fn>;
    computeBalance: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prisma = {
      account: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    balance = {
      computeBalances: vi.fn(),
      computeBalance: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AccountBalanceService, useValue: balance },
      ],
    }).compile();

    service = moduleRef.get(AccountsService);
  });

  describe('create', () => {
    it('cria conta e retorna balance = initialBalance', async () => {
      prisma.account.create.mockResolvedValue(buildAccount());

      const result = await service.create('user_1', {
        name: 'Nubank',
        type: 'CHECKING',
        initialBalance: 100,
      });

      expect(prisma.account.create).toHaveBeenCalledOnce();
      expect(result.balance.toString()).toBe('100');
    });

    it('converte P2002 em ConflictException', async () => {
      prisma.account.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('unique', {
          code: 'P2002',
          clientVersion: '7.10.1',
        }),
      );

      await expect(
        service.create('user_1', {
          name: 'Dup',
          type: 'CHECKING',
          initialBalance: 0,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('propaga erro não-P2002', async () => {
      prisma.account.create.mockRejectedValue(new Error('boom'));
      await expect(
        service.create('user_1', {
          name: 'X',
          type: 'CHECKING',
          initialBalance: 0,
        }),
      ).rejects.toThrow('boom');
    });
  });

  describe('list', () => {
    it('retorna [] sem chamar balance quando não há contas', async () => {
      prisma.account.findMany.mockResolvedValue([]);
      const result = await service.list('user_1', { includeArchived: false });
      expect(result).toEqual([]);
      expect(balance.computeBalances).not.toHaveBeenCalled();
    });

    it('anexa balance de cada conta', async () => {
      prisma.account.findMany.mockResolvedValue([
        buildAccount({ id: 'a', initialBalance: D(100) }),
        buildAccount({ id: 'b', initialBalance: D(200) }),
      ]);
      balance.computeBalances.mockResolvedValue(
        new Map([
          ['a', D(150)],
          ['b', D(80)],
        ]),
      );

      const result = await service.list('user_1', { includeArchived: false });

      expect(balance.computeBalances).toHaveBeenCalledWith(
        'user_1',
        ['a', 'b'],
        undefined,
      );
      expect(result.map((r) => r.balance.toString())).toEqual(['150', '80']);
    });

    it('repassa asOf para o balance service', async () => {
      prisma.account.findMany.mockResolvedValue([buildAccount({ id: 'a' })]);
      balance.computeBalances.mockResolvedValue(new Map([['a', D(0)]]));

      await service.list('user_1', {
        includeArchived: false,
        balanceAt: '2025-01-31',
      });

      expect(balance.computeBalances).toHaveBeenCalledWith(
        'user_1',
        ['a'],
        '2025-01-31',
      );
    });

    it('usa Decimal(0) quando balance não tem a conta', async () => {
      prisma.account.findMany.mockResolvedValue([buildAccount({ id: 'a' })]);
      balance.computeBalances.mockResolvedValue(new Map());

      const [row] = await service.list('user_1', { includeArchived: false });
      expect(row.balance.toString()).toBe('0');
    });
  });

  describe('findOne', () => {
    it('404 quando não existe', async () => {
      prisma.account.findFirst.mockResolvedValue(null);
      await expect(service.findOne('u', 'nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('anexa balance', async () => {
      prisma.account.findFirst.mockResolvedValue(buildAccount());
      balance.computeBalance.mockResolvedValue(D(42));

      const result = await service.findOne('u', 'acc_1');
      expect(result.balance.toString()).toBe('42');
    });
  });

  describe('update', () => {
    it('404 quando não existe', async () => {
      prisma.account.findFirst.mockResolvedValue(null);
      await expect(
        service.update('u', 'x', { name: 'y' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('bloqueia CREDIT_CARD sem creditLimit no estado final', async () => {
      prisma.account.findFirst.mockResolvedValue(
        buildAccount({ type: 'CREDIT_CARD', creditLimit: null }),
      );
      prisma.account.findUniqueOrThrow.mockResolvedValue({ creditLimit: null });

      await expect(
        service.update('u', 'acc_1', { name: 'x' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('bloqueia creditLimit em conta não-cartão', async () => {
      prisma.account.findFirst.mockResolvedValue(
        buildAccount({ type: 'CHECKING' }),
      );
      await expect(
        service.update('u', 'acc_1', { creditLimit: 100 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('bloqueia closingDay em conta não-cartão', async () => {
      prisma.account.findFirst.mockResolvedValue(
        buildAccount({ type: 'CHECKING' }),
      );
      await expect(
        service.update('u', 'acc_1', { closingDay: 5 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('P2002 → ConflictException', async () => {
      prisma.account.findFirst.mockResolvedValue(
        buildAccount({ type: 'CHECKING' }),
      );
      prisma.account.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('unique', {
          code: 'P2002',
          clientVersion: '7.10.1',
        }),
      );
      await expect(
        service.update('u', 'acc_1', { name: 'dup' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('atualiza com sucesso', async () => {
      prisma.account.findFirst.mockResolvedValue(
        buildAccount({ type: 'CHECKING' }),
      );
      prisma.account.update.mockResolvedValue(buildAccount({ name: 'Novo' }));

      const result = await service.update('u', 'acc_1', { name: 'Novo' });
      expect(result.name).toBe('Novo');
    });
  });

  describe('archive/unarchive', () => {
    it('archive: 404 quando não existe', async () => {
      prisma.account.findFirst.mockResolvedValue(null);
      await expect(service.archive('u', 'x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('archive: idempotente', async () => {
      prisma.account.findFirst.mockResolvedValue(
        buildAccount({ archivedAt: new Date() }),
      );
      const result = await service.archive('u', 'acc_1');
      expect(result.message).toMatch(/já arquivada/i);
      expect(prisma.account.update).not.toHaveBeenCalled();
    });

    it('archive: grava archivedAt', async () => {
      prisma.account.findFirst.mockResolvedValue(buildAccount());
      prisma.account.update.mockResolvedValue(buildAccount());
      await service.archive('u', 'acc_1');
      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: 'acc_1' },
        data: { archivedAt: expect.any(Date) },
      });
    });

    it('unarchive: idempotente', async () => {
      prisma.account.findFirst.mockResolvedValue(buildAccount());
      const result = await service.unarchive('u', 'acc_1');
      expect(result.message).toMatch(/já está ativa/i);
    });
  });

  describe('remove', () => {
    it('404 quando não existe', async () => {
      prisma.account.findFirst.mockResolvedValue(null);
      await expect(service.remove('u', 'x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it.each([
      [
        'transactions',
        {
          transactions: 1,
          incomingTransfers: 0,
          recurrings: 0,
          recurringIncoming: 0,
          importBatches: 0,
          investments: 0,
        },
      ],
      [
        'incomingTransfers',
        {
          transactions: 0,
          incomingTransfers: 1,
          recurrings: 0,
          recurringIncoming: 0,
          importBatches: 0,
          investments: 0,
        },
      ],
      [
        'recurrings',
        {
          transactions: 0,
          incomingTransfers: 0,
          recurrings: 1,
          recurringIncoming: 0,
          importBatches: 0,
          investments: 0,
        },
      ],
      [
        'recurringIncoming',
        {
          transactions: 0,
          incomingTransfers: 0,
          recurrings: 0,
          recurringIncoming: 1,
          importBatches: 0,
          investments: 0,
        },
      ],
      [
        'importBatches',
        {
          transactions: 0,
          incomingTransfers: 0,
          recurrings: 0,
          recurringIncoming: 0,
          importBatches: 1,
          investments: 0,
        },
      ],
      [
        'investments',
        {
          transactions: 0,
          incomingTransfers: 0,
          recurrings: 0,
          recurringIncoming: 0,
          importBatches: 0,
          investments: 1,
        },
      ],
    ])('bloqueia delete quando tem %s', async (_label, counts) => {
      prisma.account.findFirst.mockResolvedValue({
        id: 'acc_1',
        _count: counts,
      });
      await expect(service.remove('u', 'acc_1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.account.delete).not.toHaveBeenCalled();
    });

    it('deleta quando sem histórico', async () => {
      prisma.account.findFirst.mockResolvedValue({
        id: 'acc_1',
        _count: {
          transactions: 0,
          incomingTransfers: 0,
          recurrings: 0,
          recurringIncoming: 0,
          importBatches: 0,
          investments: 0,
        },
      });
      prisma.account.delete.mockResolvedValue({});

      const result = await service.remove('u', 'acc_1');
      expect(result.message).toMatch(/excluída/i);
      expect(prisma.account.delete).toHaveBeenCalledWith({
        where: { id: 'acc_1' },
      });
    });
  });
});
