export interface DefaultCategory {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Moradia', type: 'EXPENSE', icon: 'house', color: '#3B82F6' },
  { name: 'Alimentação', type: 'EXPENSE', icon: 'utensils', color: '#F97316' },
  { name: 'Transporte', type: 'EXPENSE', icon: 'car', color: '#8B5CF6' },
  { name: 'Lazer', type: 'EXPENSE', icon: 'party-popper', color: '#EC4899' },
  { name: 'Saúde', type: 'EXPENSE', icon: 'heart-pulse', color: '#EF4444' },
  {
    name: 'Educação',
    type: 'EXPENSE',
    icon: 'graduation-cap',
    color: '#0EA5E9',
  },
  { name: 'Assinaturas', type: 'EXPENSE', icon: 'repeat', color: '#6366F1' },
  { name: 'Compras', type: 'EXPENSE', icon: 'shopping-bag', color: '#F59E0B' },
  {
    name: 'Contas e Serviços',
    type: 'EXPENSE',
    icon: 'receipt',
    color: '#14B8A6',
  },
  { name: 'Viagens', type: 'EXPENSE', icon: 'plane', color: '#06B6D4' },
  {
    name: 'Impostos e Taxas',
    type: 'EXPENSE',
    icon: 'landmark',
    color: '#64748B',
  },
  { name: 'Outros', type: 'EXPENSE', icon: 'ellipsis', color: '#94A3B8' },

  { name: 'Salário', type: 'INCOME', icon: 'banknote', color: '#10B981' },
  { name: 'Freelance', type: 'INCOME', icon: 'briefcase', color: '#22C55E' },
  {
    name: 'Rendimentos',
    type: 'INCOME',
    icon: 'trending-up',
    color: '#059669',
  },
  { name: 'Reembolsos', type: 'INCOME', icon: 'undo-2', color: '#34D399' },
  { name: 'Outros', type: 'INCOME', icon: 'circle-plus', color: '#6EE7B7' },
];
