import { Injectable, Logger } from '@nestjs/common';

/**
 * CoinGecko — cotação de cripto em BRL.
 * Docs: https://www.coingecko.com/en/api/documentation
 * Free tier: 10-30 req/min sem API key.
 */
@Injectable()
export class CoinGeckoProvider {
  private readonly logger = new Logger(CoinGeckoProvider.name);

  private static readonly TIMEOUT_MS = 10_000;

  async fetchBtcBrl(): Promise<{ date: Date; value: number } | null> {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl',
      { signal: AbortSignal.timeout(CoinGeckoProvider.TIMEOUT_MS) },
    );

    if (!res.ok) {
      throw new Error(`CoinGecko BTC-BRL: HTTP ${res.status}`);
    }

    const json = (await res.json()) as { bitcoin?: { brl?: number } };
    const value = json.bitcoin?.brl;

    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      this.logger.warn('CoinGecko BTC-BRL: valor inválido recebido.');
      return null;
    }

    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return { date, value };
  }
}
