import { ParseResult } from './parser.types.js';

export interface FileParser {
  /**
   * @param buffer Conteúdo bruto do arquivo
   * @param options Configuração específica do formato (ex: mapping de CSV)
   */
  parse(buffer: Buffer, options?: unknown): ParseResult;
}
