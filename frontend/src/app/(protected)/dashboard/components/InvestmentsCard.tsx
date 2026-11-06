import {
    ArrowRightIcon,
    LandmarkIcon,
    ShieldIcon,
    BitcoinIcon,
} from 'lucide-react';

const investments = [
    {
        name: 'CDB 110% do CDI',
        desc: 'Renda fixa • Nubank',
        value: 'R$ 18.000,00',
        profit: '+R$ 180,00 no mês',
        icon: LandmarkIcon,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-50',
    },
    {
        name: 'Tesouro Selic 2029',
        desc: 'Tesouro Direto • Itaú',
        value: 'R$ 10.000,00',
        profit: '+R$ 85,00 no mês',
        icon: ShieldIcon,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50',
    },
    {
        name: 'Bitcoin',
        desc: 'Criptoativo • Nubank',
        value: 'R$ 4.900,00',
        profit: '-R$ 65,00 no mês',
        icon: BitcoinIcon,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50',
    },
];

export function InvestmentsCard() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-slate-800">
                    Investimentos
                </h2>
                <button className="text-sm font-semibold text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer">
                    Ver carteira <ArrowRightIcon size={16} />
                </button>
            </div>

            <div className="flex justify-between items-end mb-6">
                <h3 className="text-3xl font-bold text-slate-800">
                    R$ 32.900,00
                </h3>
                <span className="text-xs font-semibold text-emerald-500 text-right">
                    +0,61% <br />
                    <span className="text-slate-400 font-normal">
                        neste mês
                    </span>
                </span>
            </div>

            <div className="flex flex-col gap-4">
                {investments.map((inv, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-xl ${inv.iconBg} ${inv.iconColor}`}
                            >
                                <inv.icon size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    {inv.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {inv.desc}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">
                                {inv.value}
                            </p>
                            <p
                                className={`text-xs font-medium ${inv.profit.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}
                            >
                                {inv.profit}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
