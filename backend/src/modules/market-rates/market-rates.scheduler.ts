import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketRatesService } from './market-rates.service.js';
import { BcbProvider } from './providers/bcb.provider.js';
import { AwesomeApiProvider } from './providers/awesome-api.provider.js';
import { CoinGeckoProvider } from './providers/coingecko.provider.js';

interface SyncStats {
  persisted: number;
  failed: number;
  sourcesWithError: string[];
  sourcesEmpty: string[];
}

const DAILY_LOOKBACK_DAYS = 5;

const INITIAL_LOADBACK_DAYS = 365;

type DailyIndicator = 'CDI' | 'SELIC';
type PointIndicator = 'USD_BRL' | 'BTC_BRL';

@Injectable()
export class MarketRatesScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(MarketRatesScheduler.name);
  private isSyncing = false;

  constructor(
    private readonly marketRatesService: MarketRatesService,
    private readonly bcb: BcbProvider,
    private readonly awesome: AwesomeApiProvider,
    private readonly coingecko: CoinGeckoProvider,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    name: 'sync_market_rates',
    timeZone: 'UTC',
  })
  async handleCron() {
    await this.syncRates(DAILY_LOOKBACK_DAYS);
  }

  async onApplicationBootstrap() {
    if (!(await this.marketRatesService.hasAnyRates())) {
      this.logger.log(
        `Banco vazio — rodando sync inicial (${INITIAL_LOADBACK_DAYS} dias)...`,
      );
      await this.syncRates(INITIAL_LOADBACK_DAYS);
    }
  }

  private async syncRates(lookbackDays: number) {
    if (this.isSyncing) {
      this.logger.warn('Sync já em andamento — ignorando chamada concorrente.');
      return;
    }
    this.isSyncing = true;

    this.logger.log(`Iniciando sync (lookback: ${lookbackDays} dias)...`);
    const startTime = Date.now();

    try {
      const [cdi, selic, usd, btc] = await Promise.allSettled([
        this.bcb.fetchSerie(12, lookbackDays),
        this.bcb.fetchSerie(11, lookbackDays),
        this.awesome.fetchUsdBrl(),
        this.coingecko.fetchBtcBrl(),
      ]);

      const stats = {
        persisted: 0,
        failed: 0,
        sourcesWithError: [] as string[],
        sourcesEmpty: [] as string[],
      };

      this.consumeSerieResult('CDI', cdi, stats);
      this.consumeSerieResult('SELIC', selic, stats);
      this.consumePointResult('USD_BRL', usd, stats);
      this.consumePointResult('BTC_BRL', btc, stats);

      const duration = Date.now() - startTime;

      if (stats.persisted === 0) {
        this.logger.error(
          `Sync finalizado SEM nenhum registro persistido (${duration}ms). ` +
            `Falhas: [${stats.sourcesWithError.join(', ')}]. ` +
            `Vazias: [${stats.sourcesEmpty.join(', ')}].`,
        );
      } else if (stats.failed > 0 || stats.sourcesWithError.length > 0) {
        this.logger.warn(
          `Sync parcial (${duration}ms): ${stats.persisted} registros persistidos, ` +
            `${stats.failed} falhas. ` +
            `Fontes com erro: [${stats.sourcesWithError.join(', ')}].`,
        );
      } else {
        this.logger.log(
          `Sync concluído com sucesso (${duration}ms): ${stats.persisted} registros.`,
        );
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async consumeSerieResult(
    indicator: DailyIndicator,
    result: PromiseSettledResult<Array<{ date: Date; value: number }>>,
    stats: SyncStats,
  ) {
    if (result.status === 'rejected') {
      stats.sourcesWithError.push(indicator);
      this.logger.error(
        `${indicator}: provider rejeitou — ${this.errMessage(result.reason)}`,
      );
      return;
    }

    const rows = result.value;
    if (rows.length === 0) {
      stats.sourcesEmpty.push(indicator);
      this.logger.warn(`${indicator}: nenhum dado recebido da fonte.`);
      return;
    }

    const { persisted, failed } = await this.persistMany(indicator, rows);
    stats.persisted += persisted;
    stats.failed += failed;
  }

  private async consumePointResult(
    indicator: PointIndicator,
    result: PromiseSettledResult<{ date: Date; value: number } | null>,
    stats: SyncStats,
  ) {
    if (result.status === 'rejected') {
      stats.sourcesWithError.push(indicator);
      this.logger.error(
        `${indicator}: provider rejeitou — ${this.errMessage(result.reason)}`,
      );
      return;
    }

    const row = result.value;
    if (!row) {
      stats.sourcesEmpty.push(indicator);
      this.logger.warn(`${indicator}: provider retornou vazio.`);
      return;
    }

    try {
      await this.marketRatesService.upsertRate(indicator, row.date, row.value);
      stats.persisted++;
      this.logger.log(
        `${indicator} ${row.date.toISOString().slice(0, 10)}: atualizado.`,
      );
    } catch (err) {
      stats.failed++;
      this.logger.error(
        `${indicator} ${row.date.toISOString().slice(0, 10)}: falha ao persistir — ${this.errMessage(err)}`,
      );
    }
  }

  private async persistMany(
    indicator: DailyIndicator,
    rows: Array<{ date: Date; value: number }>,
  ): Promise<{ persisted: number; failed: number }> {
    let persisted = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        await this.marketRatesService.upsertRate(
          indicator,
          row.date,
          row.value,
        );
        persisted++;
      } catch (err) {
        failed++;
        this.logger.error(
          `${indicator} ${row.date.toISOString().slice(0, 10)}: falha ao persistir — ${this.errMessage(err)}`,
        );
      }
    }

    this.logger.log(`${indicator}: ${persisted}/${rows.length} persistidos.`);
    return { persisted, failed };
  }

  private errMessage(err: unknown): string {
    if (err instanceof Error) return err.stack ?? err.message;
    return String(err);
  }
}
