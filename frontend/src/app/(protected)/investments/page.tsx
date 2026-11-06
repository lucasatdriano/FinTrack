'use client';

import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { Header } from '@/src/components/layout/header/Header';
import { Fab } from '@/src/components/ui/FabButton';

import { SummaryCards } from './components/SummaryCards';
import { AllocationChart } from './components/AllocationChart';
import { MonthlyEarnings } from './components/MonthlyEarnings';
import { InvestmentList } from './components/InvestmentList';
import { GlossaryTerms } from './components/GlossaryTerms';

export default function InvestmentsPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6 w-full">
            <Header
                variant="investments"
                firstName="Lucas"
                onAction={() => router.push('/investimentos/novo')}
            />
            <SummaryCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <AllocationChart />
                </div>
                <div className="lg:col-span-2">
                    <MonthlyEarnings />
                </div>
            </div>
            <InvestmentList />
            <GlossaryTerms />
            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>
            <div className="sm:hidden">
                <Fab
                    icon={<PlusIcon size={24} />}
                    toolTipText="Novo Investimento"
                    onClick={() => router.push('/investimentos/novo')}
                />
            </div>
        </div>
    );
}
