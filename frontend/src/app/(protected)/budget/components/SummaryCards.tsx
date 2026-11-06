import { TargetIcon, TrendingUpIcon, WalletIcon } from 'lucide-react';
import { cn } from '@/src/utils/cn';

export function SummaryCards() {
    const cards = [
        {
            title: 'Orçamento planejado',
            value: 'R$ 4.600,00',
            sub: 'Limite total para outubro',
            subColor: 'text-slate-400',
            icon: TargetIcon,
            iconColor: 'text-emerald-600',
            iconBg: 'bg-emerald-50',
        },
        {
            title: 'Total gasto',
            value: 'R$ 4.250,00',
            sub: '92,4% do orçamento utilizado',
            subColor: 'text-slate-500',
            icon: TrendingUpIcon,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
        },
        {
            title: 'Disponível no orçamento',
            value: 'R$ 350,00',
            sub: '7,6% do limite mensal',
            subColor: 'text-slate-400',
            icon: WalletIcon,
            iconColor: 'text-emerald-600',
            iconBg: 'bg-emerald-50',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-sm font-medium text-slate-500">
                            {card.title}
                        </span>
                        <div
                            className={cn(
                                'p-2 rounded-lg',
                                card.iconBg,
                                card.iconColor,
                            )}
                        >
                            <card.icon size={18} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {card.value}
                        </h3>
                        <p
                            className={cn(
                                'text-xs font-medium mt-1',
                                card.subColor,
                            )}
                        >
                            {card.sub}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
