import { describe, it, expect } from 'vitest';
import { CreateTransactionSchema } from './dto/create-transaction.dto.js';

describe('CreateTransactionSchema', () => {
  const base = {
    type: 'TRANSFER' as const,
    amount: 100,
    description: 'X',
    date: '2025-01-15',
    accountId: 'acc_a',
    isPaid: true,
  };

  it('rejeita TRANSFER sem destinationAccountId', () => {
    const r = CreateTransactionSchema.safeParse(base);
    expect(r.success).toBe(false);
  });

  it('rejeita TRANSFER com origem = destino', () => {
    const r = CreateTransactionSchema.safeParse({
      ...base,
      destinationAccountId: 'acc_a',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita TRANSFER com categoryId', () => {
    const r = CreateTransactionSchema.safeParse({
      ...base,
      destinationAccountId: 'acc_b',
      categoryId: 'cat_1',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita destinationAccountId em EXPENSE', () => {
    const r = CreateTransactionSchema.safeParse({
      ...base,
      type: 'EXPENSE',
      destinationAccountId: 'acc_b',
    });
    expect(r.success).toBe(false);
  });
});
