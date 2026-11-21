import { z } from 'zod';

const MoneySchema = z
  .number()
  .positive('Valor deve ser positivo')
  .multipleOf(0.01)
  .max(999_999_999.99);

const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD');

export const CreateInvestmentSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    type: z.enum([
      'CDB',
      'LCI',
      'LCA',
      'TESOURO_SELIC',
      'TESOURO_IPCA',
      'TESOURO_PREFIXADO',
      'STOCK',
      'FII',
      'CRYPTO',
      'OTHER',
    ]),
    institution: z.string().trim().min(1).max(80).optional(),
    ticker: z.string().trim().min(1).max(20).optional(),
    accountId: z.string().cuid().optional(),
    indexer: z.enum(['CDI', 'SELIC', 'IPCA', 'PREFIXED']).optional(),
    rate: z.number().positive().max(9999.9999).optional(),
    appliedAmount: MoneySchema,
    applicationDate: DateOnlySchema,
    maturityDate: DateOnlySchema.optional(),
    quantity: z.number().positive().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    const isFixedIncome = [
      'CDB',
      'LCI',
      'LCA',
      'TESOURO_SELIC',
      'TESOURO_IPCA',
      'TESOURO_PREFIXADO',
    ].includes(data.type);

    if (isFixedIncome) {
      if (!data.indexer) {
        ctx.addIssue({
          code: 'custom',
          path: ['indexer'],
          message: 'Renda fixa exige indexer',
        });
      }
      if (data.rate === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['rate'],
          message: 'Renda fixa exige rate',
        });
      }
    } else {
      if (data.indexer) {
        ctx.addIssue({
          code: 'custom',
          path: ['indexer'],
          message: 'indexer só vale para renda fixa',
        });
      }
      if (data.rate !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['rate'],
          message: 'rate só vale para renda fixa',
        });
      }
    }

    if (data.maturityDate && data.applicationDate > data.maturityDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['maturityDate'],
        message: 'Vencimento deve ser após a aplicação',
      });
    }
  });

export type CreateInvestmentDto = z.infer<typeof CreateInvestmentSchema>;
