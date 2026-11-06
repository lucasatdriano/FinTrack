'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, ChevronDownIcon, DownloadIcon } from 'lucide-react';
import { Header } from '@/src/components/layout/header/Header';

import { SummaryCards } from './components/SummaryCards';
import { CashFlowChart } from './components/CashFlowChart';
import { ExpensesDonutChart } from './components/ExpensesDonutChart';
import { InsightsPanel } from './components/InsightsPanel';
import { Fab } from '@/src/components/ui/FabButton';

export default function ReportsPage() {
    const router = useRouter();
    const [month, setMonth] = useState('Outubro de 2026');

    return (
        <div className="flex flex-col gap-6 w-full">
            <Header
                variant="reports"
                firstName="Lucas"
                onAction={() => console.log('Exportar')}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">
                        Seu mês em perspectiva
                    </h2>
                    <span className="text-sm text-slate-400">
                        Dados de 1 a 28 de outubro
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-card text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <CalendarIcon size={16} className="text-slate-400" />
                        {month}
                        <ChevronDownIcon
                            size={16}
                            className="text-slate-400 ml-1"
                        />
                    </button>
                </div>
            </div>

            <SummaryCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CashFlowChart />
                <ExpensesDonutChart />
            </div>

            <InsightsPanel />

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>

            <div className="sm:hidden">
                <Fab
                    icon={<DownloadIcon size={24} />}
                    toolTipText="Exportar Relatório"
                    onClick={() => router.push('/transacoes/nova')}
                />
            </div>
        </div>
    );
}
