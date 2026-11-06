'use client';

import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { Header } from '@/src/components/layout/header/Header';
import { Fab } from '@/src/components/ui/FabButton';
import { SummaryCards } from './components/SummaryCards';
import { BudgetCategoryList } from './components/BudgetCategoryList';
import { SideAlerts } from './components/SideAlerts';
import { InsightFooter } from './components/InsightFooter';

export default function BudgetPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6 w-full">
            <Header variant="budget" onAction={() => {}} />

            <SummaryCards />

            <div className="flex justify-between items-end mt-2">
                <h2 className="text-lg font-bold text-slate-800">
                    Seu planejamento mensal
                </h2>
                <span className="text-sm text-slate-500">Outubro de 2026</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <BudgetCategoryList />
                </div>

                <div>
                    <SideAlerts />
                </div>
            </div>

            <InsightFooter />

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>

            <div className="sm:hidden">
                <Fab
                    icon={<PlusIcon size={24} />}
                    toolTipText="Novo Orçamento"
                    onClick={() => router.push('/orcamentos/novo')}
                />
            </div>
        </div>
    );
}
