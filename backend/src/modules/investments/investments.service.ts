import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InvestmentsCalculatorService } from './investments-calculator.service.js';
import type { CreateInvestmentDto } from './dto/create-investment.dto.js';
import type { UpdateInvestmentDto } from './dto/update-investment.dto.js';
import type { ListInvestmentsQuery } from './dto/list-investments.query.js';
import type { CreateMovementDto } from './dto/create-movement.dto.js';

const INV_SELECT = {
  id: true,
  type: true,
  name: true,
  institution: true,
  ticker: true,
  indexer: true,
  rate: true,
  appliedAmount: true,
  applicationDate: true,
  maturityDate: true,
  quantity: true,
  currentValue: true,
  lastValuedAt: true,
  status: true,
  notes: true,
  accountId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: InvestmentsCalculatorService,
  ) {}

  async create(userId: string, dto: CreateInvestmentDto) {
    if (dto.accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: dto.accountId, userId },
        select: { id: true, archivedAt: true },
      });
      if (!account) throw new NotFoundException('Conta não encontrada');
      if (account.archivedAt) {
        throw new BadRequestException('Conta está arquivada');
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const investment = await tx.investment.create({
          data: {
            userId,
            type: dto.type,
            name: dto.name,
            institution: dto.institution,
            ticker: dto.ticker,
            accountId: dto.accountId,
            indexer: dto.indexer,
            rate:
              dto.rate !== undefined ? new Prisma.Decimal(dto.rate) : undefined,
            appliedAmount: new Prisma.Decimal(dto.appliedAmount),
            applicationDate: new Date(`${dto.applicationDate}T00:00:00Z`),
            maturityDate: dto.maturityDate
              ? new Date(`${dto.maturityDate}T00:00:00Z`)
              : undefined,
            quantity:
              dto.quantity !== undefined
                ? new Prisma.Decimal(dto.quantity)
                : undefined,
            currentValue: new Prisma.Decimal(dto.appliedAmount),
            lastValuedAt: new Date(),
            notes: dto.notes,
          },
          select: INV_SELECT,
        });

        await tx.investmentMovement.create({
          data: {
            investmentId: investment.id,
            type: 'APPLICATION',
            amount: new Prisma.Decimal(dto.appliedAmount),
            quantity:
              dto.quantity !== undefined
                ? new Prisma.Decimal(dto.quantity)
                : undefined,
            date: new Date(`${dto.applicationDate}T00:00:00Z`),
            notes: 'Aporte inicial',
          },
        });

        return investment;
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException('Conta foi removida durante a operação.');
      }
      throw err;
    }
  }

  async list(userId: string, query: ListInvestmentsQuery) {
    const where: Prisma.InvestmentWhereInput = {
      userId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : { status: 'ACTIVE' }),
      ...(query.accountId ? { accountId: query.accountId } : {}),
    };

    return this.prisma.investment.findMany({
      where,
      select: INV_SELECT,
      orderBy: [{ status: 'asc' }, { currentValue: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const inv = await this.prisma.investment.findFirst({
      where: { id, userId },
      select: INV_SELECT,
    });
    if (!inv) throw new NotFoundException('Investimento não encontrado');
    return inv;
  }

  async update(userId: string, id: string, dto: UpdateInvestmentDto) {
    const current = await this.prisma.investment.findFirst({
      where: { id, userId },
      select: { id: true, type: true },
    });
    if (!current) throw new NotFoundException('Investimento não encontrado');

    const isFixedIncome = [
      'CDB',
      'LCI',
      'LCA',
      'TESOURO_SELIC',
      'TESOURO_IPCA',
      'TESOURO_PREFIXADO',
    ].includes(current.type);

    if (dto.currentValue !== undefined && isFixedIncome) {
      throw new BadRequestException(
        'currentValue de renda fixa é calculado automaticamente. Use movimentos de YIELD/APPLICATION.',
      );
    }

    return this.prisma.investment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.institution !== undefined && { institution: dto.institution }),
        ...(dto.ticker !== undefined && { ticker: dto.ticker }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.currentValue !== undefined && {
          currentValue: new Prisma.Decimal(dto.currentValue),
          lastValuedAt: new Date(),
        }),
      },
      select: INV_SELECT,
    });
  }

  async remove(userId: string, id: string) {
    const inv = await this.prisma.investment.findFirst({
      where: { id, userId },
      select: { id: true, status: true },
    });
    if (!inv) throw new NotFoundException('Investimento não encontrado');

    const movements = await this.prisma.investmentMovement.count({
      where: { investmentId: id },
    });

    if (movements > 1) {
      await this.prisma.investment.update({
        where: { id },
        data: { status: 'REDEEMED' },
      });
      return { message: 'Investimento marcado como resgatado' };
    }

    await this.prisma.investment.delete({ where: { id } });
    return { message: 'Investimento excluído' };
  }

  async addMovement(
    userId: string,
    investmentId: string,
    dto: CreateMovementDto,
  ) {
    const inv = await this.prisma.investment.findFirst({
      where: { id: investmentId, userId },
      select: { id: true, appliedAmount: true, quantity: true, status: true },
    });
    if (!inv) throw new NotFoundException('Investimento não encontrado');
    if (inv.status === 'REDEEMED') {
      throw new ConflictException('Investimento já foi resgatado');
    }

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.investmentMovement.create({
        data: {
          investmentId,
          type: dto.type,
          amount: new Prisma.Decimal(dto.amount),
          quantity:
            dto.quantity !== undefined
              ? new Prisma.Decimal(dto.quantity)
              : undefined,
          date: new Date(`${dto.date}T00:00:00Z`),
          notes: dto.notes,
        },
      });

      const newApplied =
        dto.type === 'APPLICATION'
          ? inv.appliedAmount.plus(dto.amount)
          : dto.type === 'REDEMPTION'
            ? inv.appliedAmount.minus(dto.amount)
            : inv.appliedAmount;

      const newQuantity =
        dto.quantity !== undefined && inv.quantity !== null
          ? dto.type === 'APPLICATION'
            ? inv.quantity.plus(dto.quantity)
            : dto.type === 'REDEMPTION'
              ? inv.quantity.minus(dto.quantity)
              : inv.quantity
          : inv.quantity;

      await tx.investment.update({
        where: { id: investmentId },
        data: {
          appliedAmount: newApplied,
          ...(newQuantity !== inv.quantity && { quantity: newQuantity }),
        },
      });

      return movement;
    });
  }

  async listMovements(userId: string, investmentId: string) {
    const inv = await this.prisma.investment.findFirst({
      where: { id: investmentId, userId },
      select: { id: true },
    });
    if (!inv) throw new NotFoundException('Investimento não encontrado');

    return this.prisma.investmentMovement.findMany({
      where: { investmentId },
      orderBy: { date: 'desc' },
    });
  }

  async listValuations(
    userId: string,
    investmentId: string,
    from?: string,
    to?: string,
  ) {
    const inv = await this.prisma.investment.findFirst({
      where: { id: investmentId, userId },
      select: { id: true },
    });
    if (!inv) throw new NotFoundException('Investimento não encontrado');

    return this.prisma.investmentValuation.findMany({
      where: {
        investmentId,
        ...(from || to
          ? {
              date: {
                ...(from && { gte: new Date(`${from}T00:00:00Z`) }),
                ...(to && { lte: new Date(`${to}T23:59:59.999Z`) }),
              },
            }
          : {}),
      },
      orderBy: { date: 'asc' },
    });
  }

  async revaluate(userId: string, investmentId: string) {
    const inv = await this.prisma.investment.findFirst({
      where: { id: investmentId, userId, status: 'ACTIVE' },
    });
    if (!inv) throw new NotFoundException('Investimento ativo não encontrado');

    const newValue = await this.calculator.calculate(inv);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await this.prisma.$transaction([
      this.prisma.investment.update({
        where: { id: investmentId },
        data: { currentValue: newValue, lastValuedAt: new Date() },
      }),
      this.prisma.investmentValuation.upsert({
        where: {
          investmentId_date: { investmentId, date: today },
        },
        create: { investmentId, date: today, value: newValue },
        update: { value: newValue },
      }),
    ]);

    return { currentValue: newValue, date: today };
  }
}
