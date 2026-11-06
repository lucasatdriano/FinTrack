import { TrendingUpIcon, TrendingDownIcon, TargetIcon } from 'lucide-react';

const insights = [
    {
        icon: TrendingUpIcon,
        title: 'Mais dinheiro entrando',
        desc: 'Suas receitas cresceram R$ 400,00 em relação a setembro, de R$ 5.400,00 para R$ 5.800,00.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
    },
    {
        icon: TrendingDownIcon,
        title: 'Menos dinheiro saindo',
        desc: 'Você reduziu suas despesas em R$ 250,00. Uma queda de 5,56% na comparação com setembro.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
    },
    {
        icon: TargetIcon,
        title: 'Espaço para seus planos',
        desc: 'R$ 1.550,00 ficaram com você neste mês. Isso equivale a 26,72% de tudo o que recebeu.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
    },
];

export function InsightsPanel() {
    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-800">
                    O que seus números dizem
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Uma leitura rápida para ajudar nos seus próximos passos
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {insights.map((item, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div
                                className={`p-1.5 rounded-md ${item.bg} ${item.color}`}
                            >
                                <item.icon size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800">
                                {item.title}
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
