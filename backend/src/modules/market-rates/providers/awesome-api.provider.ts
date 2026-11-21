import { Injectable, Logger } from '@nestjs/common';

/**
 * AwesomeAPI — cotações em tempo real (dólar, euro, cripto).
 * Docs: https://docs.awesomeapi.com.br/api-de-moedas
 */
@Injectable()
export class AwesomeApiProvider {
  private readonly logger = new Logger(AwesomeApiProvider.name);

  private static readonly TIMEOUT_MS = 10_000;

  async fetchUsdBrl(): Promise<{ date: Date; value: number } | null> {
    const res = await fetch(
      'https://economia.awesomeapi.com.br/json/last/USD-BRL',
      { signal: AbortSignal.timeout(AwesomeApiProvider.TIMEOUT_MS) },
    );

    if (!res.ok) {
      throw new Error(`AwesomeAPI USD-BRL: HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      USDBRL?: { bid?: string; timestamp?: string };
    };

    const bid = Number(json.USDBRL?.bid);
    if (!Number.isFinite(bid) || bid <= 0) {
      this.logger.warn('AwesomeAPI USD-BRL: cotação inválida.');
      return null;
    }

    const timestamp = Number(json.USDBRL?.timestamp);
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      this.logger.warn('AwesomeAPI USD-BRL: timestamp inválido.');
      return null;
    }

    const date = new Date(timestamp * 1000);
    if (Number.isNaN(date.getTime())) {
      this.logger.warn('AwesomeAPI USD-BRL: data inválida.');
      return null;
    }

    date.setUTCHours(0, 0, 0, 0);
    return { date, value: bid };
  }
}
