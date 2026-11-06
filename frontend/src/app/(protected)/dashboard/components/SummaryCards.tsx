import {
    WalletIcon,
    ArrowDownLeftIcon,
    ArrowUpRightIcon,
    TrendingUpIcon,
} from 'lucide-react';
import { cn } from '@/src/utils/cn';

export function SummaryCards() {
    const cards = [
        {
            title: 'Saldo total',
            value: 'R$ 18.450,00',
            trend: '+ 9,17%',
            trendLabel: 'vs. mês anterior',
            icon: WalletIcon,
            color: 'emerald',
            isUp: true,
        },
        {
            title: 'Receitas do mês',
            value: 'R$ 5.800,00',
            trend: '+ 7,41%',
            trendLabel: 'vs. mês anterior',
            icon: ArrowDownLeftIcon,
            color: 'emerald',
            isUp: true,
        },
        {
            title: 'Despesas do mês',
            value: 'R$ 4.250,00',
            trend: '- 5,56%',
            trendLabel: 'vs. mês anterior',
            icon: ArrowUpRightIcon,
            color: 'blue',
            isUp: false,
        },
        {
            title: 'Total investido',
            value: 'R$ 32.900,00',
            trend: '+ 0,61%',
            trendLabel: 'vs. mês anterior',
            icon: TrendingUpIcon,
            color: 'emerald',
            isUp: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl p-5 flex flex-col justify-between border border-slate-100 shadow-sm"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-500">
                            {card.title}
                        </span>
                        <div
                            className={cn(
                                'p-2 rounded-lg',
                                card.color === 'emerald'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-blue-50 text-blue-600',
                            )}
                        >
                            <card.icon size={18} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {card.value}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <span
                                className={cn(
                                    'font-semibold flex items-center',
                                    card.isUp
                                        ? 'text-emerald-500'
                                        : 'text-emerald-500',
                                )}
                            >
                                {card.isUp ? '↗' : '↘'} {card.trend}
                            </span>
                            {card.trendLabel}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
