import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateAccountDto } from './dto/create-account.dto.js';
import type { UpdateAccountDto } from './dto/update-account.dto.js';
import type { ListAccountsQuery } from './dto/list-accounts.query.js';
import { AccountBalanceService } from './account-balance.service.js';

const ACCOUNT_SELECT = {
  id: true,
  name: true,
  bankName: true,
  type: true,
  initialBalance: true,
  color: true,
  icon: true,
  creditLimit: true,
  closingDay: true,
  dueDay: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface AccountWithBalance {
  id: string;
  name: string;
  bankName: string | null;
  type: string;
  initialBalance: Prisma.Decimal;
  color: string | null;
  icon: string | null;
  creditLimit: Prisma.Decimal | null;
  closingDay: number | null;
  dueDay: number | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  balance: Prisma.Decimal;
}

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountBalanceService: AccountBalanceService,
  ) {}

  async create(userId: string, dto: CreateAccountDto) {
    try {
      const account = await this.prisma.account.create({
        data: {
          userId,
          name: dto.name,
          bankName: dto.bankName,
          type: dto.type,
          initialBalance: new Prisma.Decimal(dto.initialBalance),
          color: dto.color,
          icon: dto.icon,
          creditLimit:
            dto.creditLimit !== undefined
              ? new Prisma.Decimal(dto.creditLimit)
              : undefined,
          closingDay: dto.closingDay,
          dueDay: dto.dueDay,
        },
        select: ACCOUNT_SELECT,
      });

      return { ...account, balance: account.initialBalance };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma conta com esse nome');
      }
      throw err;
    }
  }

  async list(
    userId: string,
    query: ListAccountsQuery,
  ): Promise<AccountWithBalance[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        ...(query.includeArchived ? {} : { archivedAt: null }),
        ...(query.type ? { type: query.type } : {}),
      },
      select: ACCOUNT_SELECT,
      orderBy: [{ archivedAt: 'asc' }, { name: 'asc' }],
    });

    if (accounts.length === 0) return [];

    const balances = await this.accountBalanceService.computeBalances(
      userId,
      accounts.map((a) => a.id),
      query.balanceAt,
    );

    return accounts.map((a) => ({
      ...a,
      balance: balances.get(a.id) ?? new Prisma.Decimal(0),
    }));
  }

  async findOne(userId: string, accountId: string, balanceAt?: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
      select: ACCOUNT_SELECT,
    });
    if (!account) throw new NotFoundException('Conta não encontrada');

    const balance = await this.accountBalanceService.computeBalance(
      userId,
      account.id,
      balanceAt,
    );
    return { ...account, balance };
  }

  async update(userId: string, accountId: string, dto: UpdateAccountDto) {
    const current = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
      select: {
        id: true,
        type: true,
        creditLimit: true,
        closingDay: true,
        dueDay: true,
        archivedAt: true,
      },
    });
    if (!current) throw new NotFoundException('Conta não encontrada');

    // Estado FINAL = current + dto (o que ficará gravado se o update passar).
    // É isso que precisa satisfazer a regra, não o dto isolado nem o current isolado.
    const finalState = {
      type: dto.type ?? current.type,
      creditLimit:
        dto.creditLimit !== undefined
          ? dto.creditLimit
          : current.creditLimit !== null
            ? current.creditLimit.toNumber()
            : null,
      closingDay:
        dto.closingDay !== undefined ? dto.closingDay : current.closingDay,
      dueDay: dto.dueDay !== undefined ? dto.dueDay : current.dueDay,
    };

    this.assertAccountTypeInvariants(finalState);

    try {
      return await this.prisma.account.update({
        where: { id: accountId },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.bankName !== undefined && { bankName: dto.bankName }),
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.initialBalance !== undefined && {
            initialBalance: new Prisma.Decimal(dto.initialBalance),
          }),
          ...(dto.color !== undefined && { color: dto.color }),
          ...(dto.icon !== undefined && { icon: dto.icon }),
          ...(dto.creditLimit !== undefined && {
            creditLimit:
              dto.creditLimit === null
                ? null
                : new Prisma.Decimal(dto.creditLimit),
          }),
          ...(dto.closingDay !== undefined && { closingDay: dto.closingDay }),
          ...(dto.dueDay !== undefined && { dueDay: dto.dueDay }),
        },
        select: ACCOUNT_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma conta com esse nome');
      }
      throw err;
    }
  }

  async archive(userId: string, accountId: string) {
    const account = await this.findAccountForArchiving(userId, accountId);

    if (account.archivedAt) return { message: 'Conta já arquivada' };

    await this.prisma.account.update({
      where: { id: accountId },
      data: { archivedAt: new Date() },
    });
    return { message: 'Conta arquivada' };
  }

  async unarchive(userId: string, accountId: string) {
    const account = await this.findAccountForArchiving(userId, accountId);

    if (!account.archivedAt) return { message: 'Conta já está ativa' };

    await this.prisma.account.update({
      where: { id: accountId },
      data: { archivedAt: null },
    });
    return { message: 'Conta reativada' };
  }

  async remove(userId: string, accountId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const account = await tx.account.findFirst({
          where: { id: accountId, userId },
          select: {
            id: true,
            _count: {
              select: {
                transactions: true,
                incomingTransfers: true,
                recurrings: true,
                recurringIncoming: true,
                importBatches: true,
                investments: true,
              },
            },
          },
        });
        if (!account) throw new NotFoundException('Conta não encontrada');

        const c = account._count;
        const hasHistory =
          c.transactions > 0 ||
          c.incomingTransfers > 0 ||
          c.recurrings > 0 ||
          c.recurringIncoming > 0 ||
          c.importBatches > 0 ||
          c.investments > 0;

        if (hasHistory) {
          throw new ConflictException(
            'Conta possui histórico. Arquive em vez de excluir.',
          );
        }

        await tx.account.delete({ where: { id: accountId } });
        return { message: 'Conta excluída' };
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'Conta possui histórico. Arquive em vez de excluir.',
        );
      }
      throw err;
    }
  }

  private async findAccountForArchiving(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
      select: { id: true, archivedAt: true },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    return account;
  }

  private assertAccountTypeInvariants(state: {
    type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'WALLET' | 'INVESTMENT';
    creditLimit: number | null;
    closingDay: number | null;
    dueDay: number | null;
  }): void {
    const isCard = state.type === 'CREDIT_CARD';

    if (isCard) {
      if (state.creditLimit === null) {
        throw new BadRequestException('Cartão de crédito exige creditLimit');
      }
      if (state.closingDay === null) {
        throw new BadRequestException('Cartão de crédito exige closingDay');
      }
      if (state.dueDay === null) {
        throw new BadRequestException('Cartão de crédito exige dueDay');
      }
    } else {
      if (state.creditLimit !== null) {
        throw new BadRequestException(
          'creditLimit só é permitido em contas do tipo CREDIT_CARD',
        );
      }
      if (state.closingDay !== null) {
        throw new BadRequestException(
          'closingDay só é permitido em CREDIT_CARD',
        );
      }
      if (state.dueDay !== null) {
        throw new BadRequestException('dueDay só é permitido em CREDIT_CARD');
      }
    }
  }
}
