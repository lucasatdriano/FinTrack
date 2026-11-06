import {
    LayoutDashboardIcon,
    ArrowLeftRightIcon,
    WalletIcon,
    TrendingUpIcon,
    SettingsIcon,
    type LucideIcon,
} from 'lucide-react';

export interface BottombarItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

export const bottomBarItems: BottombarItem[] = [
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
        label: 'Contas',
        href: '/bankAccounts',
    },
    {
        icon: TrendingUpIcon,
        label: 'Investimentos',
        href: '/investments',
    },
    {
        icon: SettingsIcon,
        label: 'Configurações',
        href: '/settings',
    },
];
