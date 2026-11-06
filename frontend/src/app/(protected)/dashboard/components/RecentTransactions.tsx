import {
    ArrowRightIcon,
    ArrowDownLeftIcon,
    ArrowUpRightIcon,
} from 'lucide-react';
import { cn } from '@/src/utils/cn';

const transactions = [
    {
        desc: 'Projeto freelance',
        date: '28/10/2026',
        category: 'Trabalho',
        account: 'Nubank',
        value: '+ R$ 600,00',
        isIncome: true,
    },
    {
        desc: 'Supermercado',
        date: '27/10/2026',
        category: 'Alimentação',
        account: 'Nubank',
        value: '- R$ 650,00',
        isIncome: false,
    },
    {
        desc: 'Farmácia',
        date: '26/10/2026',
        category: 'Saúde',
        account: 'Nubank',
        value: '- R$ 150,00',
        isIncome: false,
    },
    {
        desc: 'Restaurante',
        date: '25/10/2026',
        category: 'Alimentação',
        account: 'Itaú',
        value: '- R$ 350,00',
        isIncome: false,
    },
    {
        desc: 'Combustível',
        date: '24/10/2026',
        category: 'Transporte',
        account: 'Itaú',
        value: '- R$ 300,00',
        isIncome: false,
    },
];

export function RecentTransactions() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                    Últimas transações
                </h2>
                <button className="text-sm font-semibold text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer">
                    Ver todas <ArrowRightIcon size={16} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50">
                            <th className="py-3 px-4 font-medium rounded-tl-lg">
                                Descrição
                            </th>
                            <th className="py-3 px-4 font-medium">Categoria</th>
                            <th className="py-3 px-4 font-medium">Conta</th>
                            <th className="py-3 px-4 font-medium text-right rounded-tr-lg">
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {transactions.map((t, i) => (
                            <tr
                                key={i}
                                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                            >
                                <td className="py-3 px-4 flex items-center gap-3">
                                    <div
                                        className={cn(
                                            'p-1.5 rounded-md',
                                            t.isIncome
                                                ? 'bg-emerald-50 text-emerald-500'
                                                : 'bg-blue-50 text-blue-500',
                                        )}
                                    >
                                        {t.isIncome ? (
                                            <ArrowDownLeftIcon size={16} />
                                        ) : (
                                            <ArrowUpRightIcon size={16} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700">
                                            {t.desc}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {t.date}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">
                                        {t.category}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-slate-500">
                                    {t.account}
                                </td>
                                <td
                                    className={cn(
                                        'py-3 px-4 text-right font-semibold',
                                        t.isIncome
                                            ? 'text-emerald-500'
                                            : 'text-slate-700',
                                    )}
                                >
                                    {t.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
