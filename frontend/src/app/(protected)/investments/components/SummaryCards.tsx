import { TrendingUpIcon, ShieldCheckIcon } from 'lucide-react';

export function SummaryCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-slate-500">
                        Patrimônio investido
                    </span>
                    <TrendingUpIcon size={18} className="text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        R$ 32.900,00
                    </h3>
                    <p className="text-xs text-emerald-500 font-medium">
                        ↗ 0,61% vs. mês anterior
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-slate-500">
                        Rendimento em outubro
                    </span>
                    <TrendingUpIcon size={18} className="text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        + R$ 200,00
                    </h3>
                    <p className="text-xs text-emerald-500 font-medium">
                        +0,61% de rentabilidade no mês
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-slate-500">
                        Alocação em renda fixa
                    </span>
                    <ShieldCheckIcon size={18} className="text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        85,1%
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                        R$ 28.000,00 em 2 ativos
                    </p>
                </div>
            </div>
        </div>
    );
}
