import {
    ArrowDownLeftIcon,
    ArrowUpRightIcon,
    PiggyBankIcon,
} from 'lucide-react';

export function SummaryCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-slate-500">
                        Receitas no período
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <ArrowDownLeftIcon size={18} />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        R$ 5.800,00
                    </h3>
                    <p className="text-xs text-slate-500">
                        <span className="text-emerald-500 font-semibold">
                            ↗ 7,41%
                        </span>{' '}
                        vs. mês anterior
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-slate-500">
                        Despesas no período
                    </span>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <ArrowUpRightIcon size={18} />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        R$ 4.250,00
                    </h3>
                    <p className="text-xs text-slate-500">
                        <span className="text-emerald-500 font-semibold">
                            ↘ 5,56%
                        </span>{' '}
                        vs. mês anterior
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-slate-500">
                        Economia no período
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <PiggyBankIcon size={18} />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        R$ 1.550,00
                    </h3>
                    <p className="text-xs text-slate-500">
                        <span className="text-emerald-500 font-semibold">
                            26,72%
                        </span>{' '}
                        das suas receitas
                    </p>
                </div>
            </div>
        </div>
    );
}
