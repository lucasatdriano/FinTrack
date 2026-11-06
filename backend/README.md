# FinTrack — Backend

API REST do FinTrack, construída com **NestJS**, **Prisma** e **PostgreSQL**.

## Stack

- [NestJS](https://nestjs.com/) (TypeScript)
- [Prisma](https://www.prisma.io/) ORM + PostgreSQL
- Redis (cache) e BullMQ (filas e jobs)
- `@nestjs/schedule` para tarefas agendadas (recorrências, cotações)
- JWT (access + refresh token) para autenticação

## Estrutura

```
backend/
├── prisma/
│   ├── schema.prisma      # modelo de dados (fonte da verdade)
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── accounts/
│   │   ├── categories/
│   │   ├── transactions/
│   │   ├── recurring/         # transações recorrentes (cron)
│   │   ├── budgets/
│   │   ├── investments/
│   │   ├── market-data/       # cotações e indicadores (brapi, Banco Central)
│   │   ├── imports/           # CSV / OFX
│   │   ├── notifications/
│   │   └── mail/
│   ├── common/                # guards, filtros, decorators, pipes
│   └── main.ts
├── Dockerfile
└── .env.example
```

Cada módulo segue o padrão do Nest: `controller`, `service`, `dto/` e testes.

## Como rodar

```bash
npm install

# infraestrutura (a partir da raiz do repositório)
docker compose up -d postgres redis

# banco
npx prisma migrate dev
npx prisma db seed        # opcional

# aplicação
npm run start:dev
```

A API sobe em `http://localhost:3001`.

## Variáveis de ambiente

| Variável                    | Descrição                       |
| --------------------------- | ------------------------------- |
| `PORT`                      | Porta da API (padrão `3001`)    |
| `DATABASE_URL`              | String de conexão do PostgreSQL |
| `REDIS_HOST` / `REDIS_PORT` | Conexão com o Redis             |
| `JWT_SECRET`                | Segredo do access token         |
| `JWT_REFRESH_SECRET`        | Segredo do refresh token        |
| `FRONTEND_URL`              | Origem permitida no CORS        |

Integrações planejadas usam variáveis adicionais (token da brapi, credenciais do agregador bancário, SMTP), sempre lidas do ambiente.

> Fora do Docker, use `localhost` no host da `DATABASE_URL`. Dentro do Docker Compose, o host é o nome do serviço (`postgres`).

## Scripts

| Comando                     | O que faz                              |
| --------------------------- | -------------------------------------- |
| `npm run start:dev`         | Sobe a API com hot reload              |
| `npm run build`             | Compila para `dist/`                   |
| `npm run start:prod`        | Executa a build de produção            |
| `npm run test`              | Testes unitários                       |
| `npm run test:e2e`          | Testes end-to-end                      |
| `npm run lint`              | Linter                                 |
| `npx prisma studio`         | Interface visual do banco              |
| `npx prisma migrate dev`    | Cria e aplica migrations em dev        |
| `npx prisma migrate deploy` | Aplica migrations pendentes (produção) |

## Regras de domínio

- Valores monetários em `Decimal(14,2)`; `amount` é sempre positivo e o sinal vem do `type` (`INCOME`, `EXPENSE`, `TRANSFER`).
- O saldo da conta é calculado, não armazenado.
- Escritas que afetam mais de uma tabela usam `prisma.$transaction`.
- Toda query é filtrada pelo `userId` do usuário autenticado.
- Contas e categorias com histórico são arquivadas (`archivedAt`), não apagadas.
- Importações são idempotentes via `externalId` único por conta.
- Constraints que o Prisma não expressa (valores positivos, regras de transferência) ficam em migrations SQL manuais.

## Integrações externas

| Fonte                  | Uso                                             |
| ---------------------- | ----------------------------------------------- |
| brapi.dev              | Cotações da B3 (plano gratuito, com atraso)     |
| API do Banco Central   | CDI, Selic e IPCA                               |
| CoinGecko / Binance    | Cotação de criptomoedas                         |
| Agregador Open Finance | Contas e transações bancárias (somente leitura) |

As cotações são buscadas por um cron job apenas para os ativos que algum usuário possui e ficam em cache, respeitando os limites de cada provedor. A integração bancária é isolada na interface `BankProvider`, com implementações intercambiáveis (agregador e importação de arquivo).

## Docker

```bash
docker build -t fintrack-backend .
```

A imagem aplica as migrations (`prisma migrate deploy`) antes de iniciar a API. Em geral, suba tudo pelo `docker compose` da raiz.
