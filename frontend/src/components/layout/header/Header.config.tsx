export type HeaderVariant =
    | 'dashboard'
    | 'transactions'
    | 'bankAccounts'
    | 'budget'
    | 'reports'
    | 'investments'
    | 'settings'
    | 'profile';

interface HeaderConfig {
    defaultTitle: string | ((name: string) => string);
    defaultSubtitle: string | ((date: Date) => string);
    buttonTitle?: string;
    haveButton?: boolean;
}

export const headerVariants: Record<HeaderVariant, HeaderConfig> = {
    dashboard: {
        defaultTitle: (name) => `Olá, ${name}!`,
        defaultSubtitle: (date) =>
            `Resumo das suas finanças em ${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        buttonTitle: 'Nova Transação',
    },

    transactions: {
        defaultTitle: 'Transações',
        defaultSubtitle:
            'Cada movimento, no seu controle. Acompanhe suas entradas e saídas.',
        buttonTitle: 'Nova Transação',
    },

    bankAccounts: {
        defaultTitle: 'Contas Bancárias',
        defaultSubtitle: 'Uma visão completa do seu dinheiro, em cada lugar.',
        buttonTitle: 'Nova Conta',
    },

    budget: {
        defaultTitle: 'Orçamento',
        defaultSubtitle:
            'Dê um destino ao seu dinheiro e mantenha seus planos em dia.',
        buttonTitle: 'Novo Orçamento',
    },

    reports: {
        defaultTitle: 'Relatórios',
        defaultSubtitle: 'Analise suas finanças com detalhes e perspectivas.',
        buttonTitle: 'Exportar Relatório',
    },

    investments: {
        defaultTitle: 'Investimentos',
        defaultSubtitle:
            'Seu patrimônio crescendo, com clareza em cada escolha.',
        buttonTitle: 'Novo Investimento',
    },

    settings: {
        defaultTitle: 'Configurações',
        defaultSubtitle:
            'Ajuste suas preferências e mantenha sua conta segura.',
        haveButton: false,
    },

    profile: {
        defaultTitle: 'Perfil',
        defaultSubtitle: 'Gerencie suas informações e preferências.',
        haveButton: false,
    },
};
