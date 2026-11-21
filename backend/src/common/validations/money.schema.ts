import { z } from 'zod';

export const MoneySchema = z
  .number()
  .finite()
  .multipleOf(0.01, 'Use no máximo 2 casas decimais')
  .max(999_999_999.99);
