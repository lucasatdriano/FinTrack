import { z } from 'zod';

export const BooleanQuery = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true');

export const BooleanQueryLoose = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');
