import 'dotenv/config';
import * as argon2 from 'argon2';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AccountType,
  Indexer,
  InvestmentMovementType,
  InvestmentType,
  Prisma,
  PrismaClient,
  RecurrenceFrequency,
  TransactionType,
} from '../src/generated/prisma/client.js';
import { DEFAULT_CATEGORIES } from '../src/modules/categories/default-categories.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_EMAIL = 'demo@fintrack.dev';
const DEMO_PASSWORD = 'Demo@12345';
const DEMO_PHONE = '+5511900000000';

faker.seed(42);

const now = new Date();
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));
const today = utc(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

const monthStart = (offset: number) =>
  utc(now.getUTCFullYear(), now.getUTCMonth() - offset, 1);
const dayOf = (offset: number, day: number) => {
  const s = monthStart(offset);
  return utc(s.getUTCFullYear(), s.getUTCMonth(), day);
};
const runDates = (day: number) =>
  today.getUTCDate() >= day
    ? { last: dayOf(0, day), next: dayOf(-1, day) }
    : { last: dayOf(1, day), next: dayOf(0, day) };

const SPENDING: [string, string, [number, number]][] = [
  ['Supermercado', 'Alimentação', [120, 420]],
  ['Restaurante', 'Alimentação', [40, 150]],
  ['Uber', 'Transporte', [15, 60]],
  ['Combustível', 'Transporte', [150, 250]],
  ['Cinema', 'Lazer', [40, 90]],
  ['Bar com amigos', 'Lazer', [60, 200]],
  ['Farmácia', 'Saúde', [25, 120]],
  ['Compra online', 'Compras', [60, 350]],
];

function valuations(start: number, monthlyRate: number, wobble = 0) {
  let value = start;
  const rows: { date: Date; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const noise = wobble
      ? faker.number.float({ min: -wobble, max: wobble, fractionDigits: 4 })
      : 0;
    value = Number((value * (1 + monthlyRate + noise)).toFixed(2));
    rows.push({ date: i === 0 ? today : monthStart(i), value });
  }
  return rows;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('O seed de demonstração não deve rodar em produção.');
  }

  // ---------- limpeza do usuário demo ----------
  // Apaga transações e recorrências antes do usuário, por causa do onDelete: Restrict
  // nas contas. O resto sai em cascata junto com o usuário.
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });
  if (existing) {
    await prisma.transaction.deleteMany({ where: { userId: existing.id } });
    await prisma.recurringTransaction.deleteMany({
      where: { userId: existing.id },
    });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  // ---------- usuário e categorias ----------
  const user = await prisma.user.create({
    data: {
      name: 'Usuário Demo',
      email: DEMO_EMAIL,
      phone: DEMO_PHONE,
      passwordHash: await argon2.hash(DEMO_PASSWORD),
      emailVerifiedAt: now,
      settings: { create: {} },
    },
  });

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user.id })),
  });
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
  });
  const cat = (type: 'INCOME' | 'EXPENSE', name: string) => {
    const found = categories.find((c) => c.type === type && c.name === name);
    if (!found) throw new Error(`Categoria não encontrada: ${type}/${name}`);
    return found.id;
  };

  // ---------- contas ----------
  const [nubank, itau, card, wallet, broker] = await Promise.all([
    prisma.account.create({
      data: {
        userId: user.id,
        name: 'Nubank',
        bankName: 'Nubank',
        type: AccountType.CHECKING,
        initialBalance: 2500,
        color: '#8B5CF6',
      },
    }),
    prisma.account.create({
      data: {
        userId: user.id,
        name: 'Itaú Reserva',
        bankName: 'Itaú',
        type: AccountType.CHECKING,
        initialBalance: 1000,
        color: '#F97316',
      },
    }),
    prisma.account.create({
      data: {
        userId: user.id,
        name: 'Nubank Cartão',
        bankName: 'Nubank',
        type: AccountType.CREDIT_CARD,
        initialBalance: 0,
        creditLimit: 8000,
        closingDay: 25,
        dueDay: 5,
        color: '#7C3AED',
      },
    }),
    prisma.account.create({
      data: {
        userId: user.id,
        name: 'Carteira',
        type: AccountType.WALLET,
        initialBalance: 200,
        color: '#10B981',
      },
    }),
    prisma.account.create({
      data: {
        userId: user.id,
        name: 'Corretora Inter',
        bankName: 'Inter',
        type: AccountType.INVESTMENT,
        initialBalance: 0,
        color: '#F59E0B',
      },
    }),
  ]);

  // ---------- transações (últimos 6 meses) ----------
  const txs: Prisma.TransactionCreateManyInput[] = [];
  const add = (
    date: Date,
    type: TransactionType,
    amount: number,
    description: string,
    accountId: string,
    category?: string,
    extra: Partial<Prisma.TransactionCreateManyInput> = {},
  ) => {
    if (date > today) return; // não cria transações no futuro
    txs.push({
      userId: user.id,
      date,
      type,
      amount,
      description,
      accountId,
      categoryId: category
        ? cat(type === TransactionType.INCOME ? 'INCOME' : 'EXPENSE', category)
        : null,
      ...extra,
    });
  };

  const salaries = [5200, 5200, 5600, 5200, 6100, 5800];
  for (let i = 5; i >= 0; i--) {
    add(
      dayOf(i, 5),
      TransactionType.INCOME,
      salaries[5 - i]!,
      'Salário',
      nubank.id,
      'Salário',
    );
    if (i % 2 === 0) {
      add(
        dayOf(i, 18),
        TransactionType.INCOME,
        faker.number.int({ min: 400, max: 1500 }),
        'Projeto freelance',
        itau.id,
        'Freelance',
      );
    }
    add(
      dayOf(i, 20),
      TransactionType.INCOME,
      faker.number.float({ min: 100, max: 140, fractionDigits: 2 }),
      'Rendimento CDB',
      nubank.id,
      'Rendimentos',
    );

    add(
      dayOf(i, 10),
      TransactionType.EXPENSE,
      1500,
      'Aluguel',
      nubank.id,
      'Moradia',
    );
    add(
      dayOf(i, 12),
      TransactionType.EXPENSE,
      119.9,
      'Internet',
      nubank.id,
      'Contas e Serviços',
    );
    add(
      dayOf(i, 15),
      TransactionType.EXPENSE,
      55.9,
      'Netflix',
      card.id,
      'Assinaturas',
    );
    add(
      dayOf(i, 16),
      TransactionType.EXPENSE,
      21.9,
      'Spotify',
      card.id,
      'Assinaturas',
    );

    add(
      dayOf(i, 6),
      TransactionType.TRANSFER,
      200,
      'Saque para carteira',
      nubank.id,
      undefined,
      { destinationAccountId: wallet.id },
    );
    add(
      dayOf(i, 7),
      TransactionType.TRANSFER,
      300,
      'Reserva mensal',
      nubank.id,
      undefined,
      { destinationAccountId: itau.id },
    );

    for (let k = 0; k < 12; k++) {
      const [description, category, [min, max]] =
        faker.helpers.arrayElement(SPENDING);
      const accountId =
        category === 'Lazer' || category === 'Compras' ? card.id : nubank.id;
      add(
        dayOf(i, faker.number.int({ min: 1, max: 28 })),
        TransactionType.EXPENSE,
        faker.number.float({ min, max, fractionDigits: 2 }),
        description,
        accountId,
        category,
      );
    }
  }
  await prisma.transaction.createMany({ data: txs });

  // ---------- recorrências ----------
  const salaryRun = runDates(5);
  const rentRun = runDates(10);
  await prisma.recurringTransaction.createMany({
    data: [
      {
        userId: user.id,
        type: TransactionType.INCOME,
        amount: 5800,
        description: 'Salário',
        accountId: nubank.id,
        categoryId: cat('INCOME', 'Salário'),
        frequency: RecurrenceFrequency.MONTHLY,
        interval: 1,
        startDate: dayOf(5, 5),
        lastRunDate: salaryRun.last,
        nextRunDate: salaryRun.next,
      },
      {
        userId: user.id,
        type: TransactionType.EXPENSE,
        amount: 1500,
        description: 'Aluguel',
        accountId: nubank.id,
        categoryId: cat('EXPENSE', 'Moradia'),
        frequency: RecurrenceFrequency.MONTHLY,
        interval: 1,
        startDate: dayOf(5, 10),
        lastRunDate: rentRun.last,
        nextRunDate: rentRun.next,
      },
    ],
  });

  // ---------- orçamento do mês atual ----------
  const limits: [string, number][] = [
    ['Moradia', 1500],
    ['Alimentação', 1400],
    ['Transporte', 800],
    ['Lazer', 500],
    ['Saúde', 600],
  ];
  await prisma.budget.createMany({
    data: limits.map(([name, amount]) => ({
      userId: user.id,
      categoryId: cat('EXPENSE', name),
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      amount,
      alertThreshold: 80,
    })),
  });

  // ---------- investimentos ----------
  const cdb = valuations(13200, 0.0094);
  await prisma.investment.create({
    data: {
      userId: user.id,
      accountId: broker.id,
      type: InvestmentType.CDB,
      name: 'CDB 110% do CDI',
      institution: 'Banco Inter',
      indexer: Indexer.CDI,
      rate: 110,
      appliedAmount: 13000,
      applicationDate: dayOf(5, 3),
      maturityDate: utc(now.getUTCFullYear() + 1, 2, 15),
      currentValue: cdb.at(-1)!.value,
      lastValuedAt: now,
      movements: {
        create: [
          {
            type: InvestmentMovementType.APPLICATION,
            amount: 13000,
            date: dayOf(5, 3),
          },
        ],
      },
      valuations: { create: cdb },
    },
  });

  const selic = valuations(9900, 0.0087);
  await prisma.investment.create({
    data: {
      userId: user.id,
      accountId: broker.id,
      type: InvestmentType.TESOURO_SELIC,
      name: 'Tesouro Selic 2029',
      institution: 'Tesouro Direto',
      indexer: Indexer.SELIC,
      rate: 100,
      appliedAmount: 9800,
      applicationDate: dayOf(5, 8),
      currentValue: selic.at(-1)!.value,
      lastValuedAt: now,
      movements: {
        create: [
          {
            type: InvestmentMovementType.APPLICATION,
            amount: 9800,
            date: dayOf(5, 8),
          },
        ],
      },
      valuations: { create: selic },
    },
  });

  const btc = valuations(7400, 0.01, 0.06);
  await prisma.investment.create({
    data: {
      userId: user.id,
      accountId: broker.id,
      type: InvestmentType.CRYPTO,
      name: 'Bitcoin',
      ticker: 'BTC',
      quantity: 0.045,
      appliedAmount: 7500,
      applicationDate: dayOf(5, 12),
      currentValue: btc.at(-1)!.value,
      lastValuedAt: now,
      movements: {
        create: [
          {
            type: InvestmentMovementType.APPLICATION,
            amount: 7500,
            quantity: 0.045,
            date: dayOf(5, 12),
          },
        ],
      },
      valuations: { create: btc },
    },
  });

  console.log(`Seed concluído: ${txs.length} transações criadas.`);
  console.log(`Login de demonstração: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
