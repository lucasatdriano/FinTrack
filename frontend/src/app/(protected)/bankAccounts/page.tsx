'use client';

import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';

import { Header } from '@/src/components/layout/header/Header';
import { SummaryCards } from './components/SummaryCards';
import { AccountList } from './components/AccountList';
import { BalanceEvolution } from './components/BalanceEvolution';
import { Fab } from '@/src/components/ui/FabButton';

export default function BankAccountsPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6 w-full">
            <Header variant="bankAccounts" onAction={() => {}} />

            <SummaryCards />

            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-lg font-bold text-slate-800">
                        Suas contas
                    </h2>
                    <span className="text-sm text-slate-500">
                        28 de outubro de 2026
                    </span>
                </div>
                <AccountList />
            </div>

            <BalanceEvolution />

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>

            <div className="md:hidden">
                <Fab
                    icon={<PlusIcon size={24} />}
                    toolTipText="Nova Conta"
                    onClick={() => router.push('/contas/nova')}
                />
            </div>
        </div>
    );
}
