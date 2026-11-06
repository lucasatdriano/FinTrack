# FinTrack

App de finanças pessoais para o mercado brasileiro: contas, transações, orçamento por categoria e investimentos (renda fixa e cripto).

## Stack

- `frontend/`: Next.js (App Router, TypeScript), pasta `app/` na raiz do frontend (sem `src/`)
- `backend/`: NestJS + Prisma + PostgreSQL, Redis (cache e filas BullMQ)
- Infra: Docker Compose na raiz (`docker-compose.yaml`), Dockerfiles em cada pasta
- Futuro: serviço de insights em Python (FastAPI) em `insights/`, stateless, chamado pelo Nest via HTTP

## Estrutura

- `backend/prisma/schema.prisma`: fonte da verdade do modelo de dados
- `backend/src/modules/`: um módulo por área (auth, accounts, categories, transactions, recurring, budgets, investments, market-data, imports, notifications, mail)
- `backend/src/common/`: guards, filtros, decorators
- `frontend/app/(auth)/` e `frontend/app/(dashboard)/`: grupos de rotas com layouts diferentes
- `frontend/components/`: `ui/`, `modals/`, `charts/`

## Comandos (ajuste conforme o package.json)

- Infra local: `docker compose up -d postgres redis`
- Backend: `cd backend && npm run start:dev`
- Frontend: `cd frontend && npm run dev`
- Migrations: `cd backend && npx prisma migrate dev`
- Stack completa: `docker compose up -d --build`

## Regras do domínio

- Dinheiro sempre `Decimal(14,2)` no Prisma, nunca `float`. `amount` é sempre positivo; o sinal vem do `type` (INCOME, EXPENSE, TRANSFER)
- Saldo da conta não é armazenado: é calculado (`initialBalance` + movimentações pagas)
- Transferências e qualquer operação que mexe em mais de uma tabela usam `prisma.$transaction`
- Toda query filtra por `userId`; nunca confie em id vindo do cliente sem checar o dono
- Contas e categorias com histórico são arquivadas (`archivedAt`), não apagadas
- Importações são idempotentes via `externalId` único por conta
- O front nunca chama APIs externas (brapi, Banco Central, agregador bancário): tudo passa pelo backend, que faz cache

## Segurança

- Nunca armazenar senha de banco; tokens de sessão e de verificação são guardados apenas como hash
- Segredos só em variáveis de ambiente; `.env` nunca é versionado
- Integração bancária é somente leitura

## Convenções de trabalho

- Ao fazer pequenas adições, edite os arquivos existentes em vez de criar arquivos novos
- Validar toda entrada com DTOs no backend
- Textos explicativos de termos financeiros (CDI, Selic, IPCA...) ficam em um glossário único usado pelo componente de tooltip
