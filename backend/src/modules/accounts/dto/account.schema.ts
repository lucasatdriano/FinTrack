import { z } from 'zod';

export const AccountTypeSchema = z.enum([
  'CHECKING',
  'SAVINGS',
  'CREDIT_CARD',
  'WALLET',
  'INVESTMENT',
]);
