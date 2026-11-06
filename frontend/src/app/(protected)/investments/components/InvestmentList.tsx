import { LandmarkIcon, ShieldIcon, BitcoinIcon } from 'lucide-react';
import { CustomHelpTooltip } from '@/src/components/ui/tooltip/HelpTooltip';

const investments = [
    {
        name: 'CDB 110% do CDI',
        desc: 'Renda fixa · Nubank',
        value: 'R$ 18.000,00',
        allocation: '54,7% da carteira',
        profit: '+ R$ 180,00 no mês',
        icon: LandmarkIcon,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-50',
        tooltipTerm: 'CDB',
        tooltipDesc:
            'Título de renda fixa emitido por bancos. Ao investir, você empresta dinheiro ao emissor.',
    },
    {
        name: 'Tesouro Selic 2029',
        desc: 'Tesouro Direto · Itaú',
        value: 'R$ 10.000,00',
        allocation: '30,4% da carteira',
        profit: '+ R$ 85,00 no mês',
        icon: ShieldIcon,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50',
        tooltipTerm: 'Tesouro Selic',
        tooltipDesc:
            'Título do governo atrelado à taxa Selic. Serve como referência para os juros da economia.',
    },
    {
        name: 'Bitcoin',
        desc: 'Criptoativo · Nubank',
        value: 'R$ 4.900,00',
        allocation: '14,9% da carteira',
        profit: '- R$ 65,00 no mês',
        icon: BitcoinIcon,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50',
        tooltipTerm: 'Bitcoin',
        tooltipDesc:
            'Criptomoeda descentralizada. É um ativo de alto risco e alta volatilidade.',
    },
];

export function InvestmentList() {
    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                    Seus investimentos
                </h2>
                <button className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer">
                    + Novo
                </button>
            </div>

            <div className="flex flex-col">
                {investments.map((inv, i) => (
                    <div
                        key={i}
                        className="flex flex-col md:flex-row md:items-center justify-between py-5 border-b border-slate-100 last:border-0 gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`p-2.5 rounded-xl ${inv.iconBg} ${inv.iconColor}`}
                            >
                                <inv.icon size={22} />
                            </div>
                            <div>
                                <div className="flex items-center">
                                    <p className="text-sm font-bold text-slate-800">
                                        {inv.name}
                                    </p>
                                    <CustomHelpTooltip
                                        title="Detalhe"
                                        term={inv.tooltipTerm}
                                        description={inv.tooltipDesc}
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    {inv.desc}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col md:items-start text-xs pl-12 md:pl-0 md:w-1/4">
                            <span className="text-slate-500 font-medium">
                                {inv.allocation}
                            </span>
                            <span
                                className={`font-semibold mt-0.5 ${inv.profit.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}
                            >
                                {inv.profit}
                            </span>
                        </div>

                        <div className="flex flex-col md:items-end gap-1 pl-12 md:pl-0">
                            <p className="text-sm font-bold text-slate-800">
                                {inv.value}
                            </p>
                            <div className="flex gap-3 mt-1">
                                <button className="text-xs font-medium cursor-pointer text-slate-400 hover:text-slate-700 transition-colors">
                                    Editar
                                </button>
                                <button className="text-xs font-medium cursor-pointer text-red-400 hover:text-red-600 transition-colors">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
