'use client';

import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { Header } from '@/src/components/layout/header/Header';
import { SummaryCards } from './components/SummaryCards';
import { BudgetProgress } from './components/BudgetProgress';
import { CashFlowChart } from './components/CashFlowChart';
import { InvestmentsCard } from './components/InvestmentsCard';
import { RecentTransactions } from './components/RecentTransactions';
import { Fab } from '@/src/components/ui/FabButton';

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6 w-full">
            <Header variant="dashboard" firstName="Lucas" onAction={() => {}} />

            <SummaryCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CashFlowChart />
                <BudgetProgress />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentTransactions />
                <InvestmentsCard />
            </div>

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>

            <div className="sm:hidden">
                <Fab
                    icon={<PlusIcon size={24} />}
                    toolTipText="Nova Transação"
                    onClick={() => router.push('/transacoes/nova')}
                />
            </div>
        </div>
    );
}
