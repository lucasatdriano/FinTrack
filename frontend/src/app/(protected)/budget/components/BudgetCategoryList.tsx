import { cn } from '@/src/utils/cn';

const categories = [
    {
        name: 'Moradia',
        spent: 1800,
        limit: 1800,
        dotColor: 'bg-emerald-500',
    },
    {
        name: 'Alimentação',
        spent: 1000,
        limit: 1200,
        dotColor: 'bg-blue-500',
    },
    {
        name: 'Transporte',
        spent: 450,
        limit: 600,
        dotColor: 'bg-purple-500',
    },
    {
        name: 'Lazer',
        spent: 650,
        limit: 500,
        dotColor: 'bg-red-500',
    },
    {
        name: 'Saúde',
        spent: 350,
        limit: 500,
        dotColor: 'bg-teal-500',
    },
];

export function BudgetCategoryList() {
    return (
        <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Orçamento por categoria
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Gasto acumulado / limite mensal
                    </p>
                </div>
                <button className="text-sm font-semibold text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer">
                    + Novo
                </button>
            </div>

            <div className="flex flex-col gap-6 flex-1">
                {categories.map((b, i) => {
                    const percentage = Math.min((b.spent / b.limit) * 100, 100);

                    const isExceeded = b.spent > b.limit;
                    const isLimitReached = b.spent === b.limit;

                    return (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            b.dotColor,
                                        )}
                                    />
                                    <span className="text-slate-800 font-medium">
                                        {b.name}
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
                                    R$ {b.spent.toLocaleString('pt-BR')},00 / R${' '}
                                    {b.limit.toLocaleString('pt-BR')},00
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
                            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                                <span>Alerta em 80%</span>
                                <div className="flex gap-3">
                                    <button className="cursor-pointer hover:text-slate-700 transition-colors">
                                        Editar
                                    </button>
                                    <button className="cursor-pointer hover:text-red-500 transition-colors">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                <span className="font-bold text-slate-800 text-sm">
                    Total do mês
                </span>
                <span className="font-bold text-slate-800 text-sm">
                    R$ 4.250,00 / R$ 4.600,00
                </span>
            </div>
        </div>
    );
}
