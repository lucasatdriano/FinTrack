import {
    LayoutDashboardIcon,
    ArrowLeftRightIcon,
    WalletIcon,
    PieChartIcon,
    TrendingUpIcon,
    BarChart3Icon,
    SettingsIcon,
    CpuAiIcon,
    type LucideIcon,
} from 'lucide-react';

export interface SidebarItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

export const sidebarItems: SidebarItem[] = [
    {
        icon: LayoutDashboardIcon,
        label: 'Dashboard',
        href: '/dashboard',
    },
    {
        icon: ArrowLeftRightIcon,
        label: 'Transações',
        href: '/transactions',
    },
    {
        icon: WalletIcon,
        label: 'Contas Bancárias',
        href: '/bankAccounts',
    },

    {
        icon: PieChartIcon,
        label: 'Orçamento',
        href: '/budget',
    },
    {
        icon: TrendingUpIcon,
        label: 'Investimentos',
        href: '/investments',
    },
    {
        icon: BarChart3Icon,
        label: 'Relatórios',
        href: '/reports',
    },
    {
        icon: CpuAiIcon,
        label: 'FinTrack AI',
        href: '/fintrack-ai',
    },
    {
        icon: SettingsIcon,
        label: 'Configurações',
        href: '/settings',
    },
];
