-- ============================================================
-- Constraints de integridade que o Prisma Schema não expressa
-- ============================================================

-- Transações: amount positivo + regras de transferência
ALTER TABLE "transactions"
  ADD CONSTRAINT "chk_transactions_amount_positive"
    CHECK ("amount" > 0),
  ADD CONSTRAINT "chk_transactions_transfer_rules"
    CHECK (
      (
        "type" = 'TRANSFER'
        AND "destinationAccountId" IS NOT NULL
        AND "destinationAccountId" <> "accountId"
        AND "categoryId" IS NULL
      )
      OR
      (
        "type" <> 'TRANSFER'
        AND "destinationAccountId" IS NULL
      )
    );

-- Orçamentos: mês válido + threshold válido
ALTER TABLE "budgets"
  ADD CONSTRAINT "chk_budgets_month"
    CHECK ("month" BETWEEN 1 AND 12),
  ADD CONSTRAINT "chk_budgets_threshold"
    CHECK ("alertThreshold" BETWEEN 1 AND 100),
  ADD CONSTRAINT "chk_budgets_amount_positive"
    CHECK ("amount" >= 0);

-- Contas: dia de fechamento/vencimento válido
ALTER TABLE "accounts"
  ADD CONSTRAINT "chk_accounts_closing_day"
    CHECK ("closingDay" IS NULL OR "closingDay" BETWEEN 1 AND 31),
  ADD CONSTRAINT "chk_accounts_due_day"
    CHECK ("dueDay" IS NULL OR "dueDay" BETWEEN 1 AND 31);

-- Investimentos: taxa não-negativa, quantidade não-negativa
ALTER TABLE "investments"
  ADD CONSTRAINT "chk_investments_rate_nonnegative"
    CHECK ("rate" IS NULL OR "rate" >= 0),
  ADD CONSTRAINT "chk_investments_quantity_nonnegative"
    CHECK ("quantity" IS NULL OR "quantity" >= 0);

-- Movimentos de investimento: quantidade não-negativa
ALTER TABLE "investment_movements"
  ADD CONSTRAINT "chk_inv_movements_quantity_nonnegative"
    CHECK ("quantity" IS NULL OR "quantity" >= 0);

-- Valores monetários sempre positivos em movimentações
ALTER TABLE "investment_movements"
  ADD CONSTRAINT "chk_inv_movements_amount_nonnegative"
    CHECK ("amount" >= 0);