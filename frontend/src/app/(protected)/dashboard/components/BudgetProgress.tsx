import { ArrowRightIcon } from 'lucide-react';
import { cn } from '@/src/utils/cn';

const budgets = [
    {
        category: 'Moradia',
        spent: 1800,
        limit: 1800,
        dotColor: 'bg-emerald-500',
    },
    {
        category: 'Alimentação',
        spent: 1000,
        limit: 1200,
        dotColor: 'bg-blue-500',
    },
    {
        category: 'Transporte',
        spent: 450,
        limit: 600,
        dotColor: 'bg-purple-500',
    },
    {
        category: 'Lazer',
        spent: 650,
        limit: 500,
        dotColor: 'bg-red-500',
    },
    {
        category: 'Saúde',
        spent: 350,
        limit: 500,
        dotColor: 'bg-teal-500',
    },
];

export function BudgetProgress() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                    Orçamento por categoria
                </h2>
                <button className="text-sm font-semibold text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer">
                    Detalhes <ArrowRightIcon size={16} />
                </button>
            </div>

            <div className="flex flex-col gap-5">
                {budgets.map((b, i) => {
                    const percentage = Math.min(
                        (b.spent / b.limit) * 100,
                        100,
                    );

                    const isExceeded = b.spent > b.limit;
                    const isLimitReached = b.spent === b.limit;

                    return (
                        <div key={i} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            b.dotColor,
                                        )}
                                    />
                                    <span className="text-slate-600">
                                        {b.category}
                                    </span>
                                    {isExceeded && (
                                        <span className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 rounded-md font-bold ml-1">
                                            Excedido
                                        </span>
                                    )}
                                    {isLimitReached && (
                                        <span className="bg-orange-50 text-orange-500 text-[10px] px-2 py-0.5 rounded-md font-bold ml-1">
                                            No Limite
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        isExceeded && 'text-red-500',
                                        isLimitReached && 'text-orange-500',
                                        !isExceeded &&
                                            !isLimitReached &&
                                            'text-slate-500',
                                    )}
                                >
                                    R$ {b.spent.toLocaleString('pt-BR')},00 /
                                    R$ {b.limit.toLocaleString('pt-BR')},00
                                </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all',
                                        isExceeded && 'bg-red-500',
                                        isLimitReached && 'bg-orange-400',
                                        !isExceeded &&
                                            !isLimitReached &&
                                            'bg-emerald-400',
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
