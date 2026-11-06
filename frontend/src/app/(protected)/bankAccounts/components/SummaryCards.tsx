import { WalletIcon, LandmarkIcon, ShieldCheckIcon } from 'lucide-react';
import { cn } from '@/src/utils/cn';

export function SummaryCards() {
    const cards = [
        {
            title: 'Saldo total disponível',
            value: 'R$ 18.450,00',
            sub: '↗ 9,17% vs. mês anterior',
            subColor: 'text-emerald-500',
            icon: WalletIcon,
            iconColor: 'text-emerald-600',
            iconBg: 'bg-emerald-50',
        },
        {
            title: 'Contas cadastradas',
            value: '4 contas',
            sub: '2 correntes · 1 carteira · 1 poupança',
            subColor: 'text-slate-400',
            icon: LandmarkIcon,
            iconColor: 'text-emerald-600',
            iconBg: 'bg-emerald-50',
        },
        {
            title: 'Reserva de emergência',
            value: 'R$ 2.250,00',
            sub: '12,20% do saldo disponível',
            subColor: 'text-slate-400',
            icon: ShieldCheckIcon,
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
