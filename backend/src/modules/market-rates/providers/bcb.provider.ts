import { Injectable, Logger } from '@nestjs/common';

/**
 * Cliente da API do Banco Central (SGS - Sistema Gerenciador de Séries Temporais).
 * Docs: https://dadosabertos.bcb.gov.br/dataset/11-taxa-de-juros---selic
 *
 * Séries:
 *   11  = SELIC diária
 *   12  = CDI diário
 *   433 = IPCA mensal (usar endpoint diferente no futuro)
 */
@Injectable()
export class BcbProvider {
  private readonly logger = new Logger(BcbProvider.name);
  private readonly baseUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

  private static readonly TIMEOUT_MS = 10_000;

  async fetchSerie(
    serieCode: number,
    lastDays: number,
  ): Promise<Array<{ date: Date; value: number }>> {
    if (!Number.isInteger(serieCode) || serieCode <= 0) {
      throw new Error(`Código de série inválido: ${serieCode}`);
    }
    if (!Number.isInteger(lastDays) || lastDays < 0) {
      throw new Error(`Quantidade de dias inválida: ${lastDays}`);
    }

    const end = new Date();
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - lastDays);

    const format = (d: Date) =>
      `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;

    const url = `${this.baseUrl}.${serieCode}/dados?formato=json&dataInicial=${format(start)}&dataFinal=${format(end)}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(BcbProvider.TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`BCB série ${serieCode}: HTTP ${res.status}`);
    }

    const json = (await res.json()) as Array<{ data: string; valor: string }>;

    return json
      .map((row) => {
        const [day, month, year] = row.data.split('/');
        const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
        const value = Number(row.valor.replace(',', '.'));

        if (Number.isNaN(date.getTime())) {
          this.logger.warn(
            `BCB série ${serieCode}: data inválida "${row.data}"`,
          );
          return null;
        }
        if (!Number.isFinite(value)) {
          this.logger.warn(
            `BCB série ${serieCode}: valor inválido "${row.valor}"`,
          );
          return null;
        }

        return { date, value };
      })
      .filter((r): r is { date: Date; value: number } => r !== null);
  }
}
