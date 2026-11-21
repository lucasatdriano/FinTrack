import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { MarketRatesService } from '../market-rates/market-rates.service.js';
import type { Investment } from '../../generated/prisma/client.js';

/**
 * Calcula o valor atual de um investimento de renda fixa.
 *
 * Fórmula (simplificada, juros compostos diários):
 *   - CDI:       valor = principal × (1 + CDI_diário × rate/100)^dias
 *   - SELIC:     valor = principal × (1 + SELIC_diário × rate/100)^dias
 *   - PREFIXED:  valor = principal × (1 + rate/100)^(dias/252)
 *   - IPCA:      valor = principal × (1 + IPCA_mensal)^meses × (1 + rate/100)^(dias/252)
 *
 * Dia útil = 252 dias/ano (convenção do mercado brasileiro).
 *
 * Simplificações conscientes:
 *   - Não aplica IR (imposto de renda) regressivo
 *   - Não aplica IOF (< 30 dias)
 *   - Não aplica come-cotas (fundos)
 *   - Não considera feriados (usa dias corridos pra PREFIXED, úteis pra CDI)
 */
@Injectable()
export class InvestmentsCalculatorService {
  private readonly logger = new Logger(InvestmentsCalculatorService.name);

  constructor(private readonly rates: MarketRatesService) {}

  async calculate(investment: Investment): Promise<Prisma.Decimal> {
    const fixedIncomeTypes = [
      'CDB',
      'LCI',
      'LCA',
      'TESOURO_SELIC',
      'TESOURO_IPCA',
      'TESOURO_PREFIXADO',
    ];

    if (!fixedIncomeTypes.includes(investment.type)) {
      return investment.currentValue;
    }

    if (!investment.indexer || investment.rate === null) {
      this.logger.warn(
        `Investimento ${investment.id} (${investment.type}) sem indexer/rate`,
      );
      return investment.currentValue;
    }

    const principal = investment.appliedAmount;
    const daysHeld = this.daysBetween(investment.applicationDate, new Date());
    if (daysHeld <= 0) return principal;

    const rate = investment.rate.toNumber();

    try {
      switch (investment.indexer) {
        case 'CDI':
          return await this.calcCdiLike(
            investment,
            principal,
            rate,
            daysHeld,
            'CDI',
          );
        case 'SELIC':
          return await this.calcCdiLike(
            investment,
            principal,
            rate,
            daysHeld,
            'SELIC',
          );
        case 'PREFIXED':
          return this.calcPrefixed(principal, rate, daysHeld);
        case 'IPCA':
          return await this.calcIpca(investment, principal, rate, daysHeld);
        default:
          return principal;
      }
    } catch (err) {
      this.logger.error(
        `Falha ao calcular investimento ${investment.id}`,
        err as Error,
      );
      return investment.currentValue;
    }
  }

  private async calcCdiLike(
    investment: Investment,
    principal: Prisma.Decimal,
    ratePct: number,
    daysHeld: number,
    indicator: 'CDI' | 'SELIC',
  ): Promise<Prisma.Decimal> {
    const latest = await this.rates.getLatestRate(indicator);
    if (!latest) {
      this.logger.warn(
        `Sem taxa ${indicator} no cache — usando appliedAmount pra ${investment.id}`,
      );
      return principal;
    }

    const annualRate = latest.value.toNumber() / 100;
    const effectiveAnnual = annualRate * (ratePct / 100);
    const dailyRate = Math.pow(1 + effectiveAnnual, 1 / 252) - 1;

    const businessDays = Math.floor((daysHeld * 252) / 365);

    const factor = Math.pow(1 + dailyRate, businessDays);
    return principal.mul(factor).toDecimalPlaces(2);
  }

  private calcPrefixed(
    principal: Prisma.Decimal,
    ratePct: number,
    daysHeld: number,
  ): Prisma.Decimal {
    const annualRate = ratePct / 100;
    const businessDays = Math.floor((daysHeld * 252) / 365);
    const factor = Math.pow(1 + annualRate, businessDays / 252);
    return principal.mul(factor).toDecimalPlaces(2);
  }

  private async calcIpca(
    investment: Investment,
    principal: Prisma.Decimal,
    realRatePct: number,
    daysHeld: number,
  ): Promise<Prisma.Decimal> {
    const latestIpca = await this.rates.getLatestRate('IPCA');
    if (!latestIpca) {
      this.logger.warn(
        `Sem IPCA no cache — usando só taxa real pra ${investment.id}`,
      );

      return this.calcPrefixed(principal, realRatePct, daysHeld);
    }

    const months = Math.floor(daysHeld / 30);
    const ipcaMonthly = latestIpca.value.toNumber() / 100;
    const realAnnual = realRatePct / 100;
    const realMonthly = Math.pow(1 + realAnnual, 1 / 12) - 1;

    const factor =
      Math.pow(1 + ipcaMonthly, months) * Math.pow(1 + realMonthly, months);
    return principal.mul(factor).toDecimalPlaces(2);
  }

  private daysBetween(from: Date, to: Date): number {
    const ms = to.getTime() - from.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }
}
