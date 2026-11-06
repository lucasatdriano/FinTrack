'use client';

import { useState } from 'react';
import { ArrowDownLeftIcon, ArrowUpRightIcon } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { Pagination } from '@/src/components/layout/pagination/Pagination';

const transactions = [
    {
        date: '28/10/2026',
        desc: 'Projeto freelance',
        category: 'Trabalho',
        account: 'Nubank',
        value: '+ R$ 600,00',
        isIncome: true,
    },
    {
        date: '27/10/2026',
        desc: 'Supermercado',
        category: 'Alimentação',
        account: 'Nubank',
        value: '- R$ 650,00',
        isIncome: false,
    },
    {
        date: '26/10/2026',
        desc: 'Farmácia',
        category: 'Saúde',
        account: 'Nubank',
        value: '- R$ 150,00',
        isIncome: false,
    },
    {
        date: '25/10/2026',
        desc: 'Restaurante',
        category: 'Alimentação',
        account: 'Itaú',
        value: '- R$ 350,00',
        isIncome: false,
    },
    {
        date: '24/10/2026',
        desc: 'Combustível',
        category: 'Transporte',
        account: 'Itaú',
        value: '- R$ 300,00',
        isIncome: false,
    },
    {
        date: '22/10/2026',
        desc: 'Jantar com amigos',
        category: 'Lazer',
        account: 'Nubank',
        value: '- R$ 300,00',
        isIncome: false,
    },
    {
        date: '20/10/2026',
        desc: 'Consulta médica',
        category: 'Saúde',
        account: 'Itaú',
        value: '- R$ 200,00',
        isIncome: false,
    },
    {
        date: '18/10/2026',
        desc: 'Cinema e passeio',
        category: 'Lazer',
        account: 'Carteira',
        value: '- R$ 200,00',
        isIncome: false,
    },
    {
        date: '15/10/2026',
        desc: 'Aplicativos de transporte',
        category: 'Transporte',
        account: 'Nubank',
        value: '- R$ 150,00',
        isIncome: false,
    },
    {
        date: '10/10/2026',
        desc: 'Assinaturas de streaming',
        category: 'Lazer',
        account: 'Nubank',
        value: '- R$ 150,00',
        isIncome: false,
    },
    {
        date: '05/10/2026',
        desc: 'Aluguel e condomínio',
        category: 'Moradia',
        account: 'Itaú',
        value: '- R$ 1.800,00',
        isIncome: false,
    },
    {
        date: '05/10/2026',
        desc: 'Salário',
        category: 'Trabalho',
        account: 'Itaú',
        value: '+ R$ 5.200,00',
        isIncome: true,
    },
];

export function TransactionTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 3;

    return (
        <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Todas as transações
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-medium">
                        <span className="text-emerald-600">
                            Receitas: R$ 5.800,00
                        </span>
                        <span className="text-blue-500">
                            Despesas: R$ 4.250,00
                        </span>
                        <span className="text-slate-800">
                            Resultado: R$ 1.550,00
                        </span>
                    </div>
                </div>
                <span className="text-sm font-semibold text-emerald-600 cursor-pointer hover:underline">
                    12 registros
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-175">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50">
                            <th className="py-3 px-4 font-medium rounded-tl-lg w-32">
                                Data
                            </th>
                            <th className="py-3 px-4 font-medium">Descrição</th>
                            <th className="py-3 px-4 font-medium w-40">
                                Categoria
                            </th>
                            <th className="py-3 px-4 font-medium w-32">
                                Conta
                            </th>
                            <th className="py-3 px-4 font-medium text-right rounded-tr-lg w-40">
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {transactions.map((t, i) => (
                            <tr
                                key={i}
                                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
                            >
                                <td className="py-4 px-4 text-slate-500 text-xs">
                                    {t.date}
                                </td>
                                <td className="py-4 px-4 flex items-center gap-3 font-medium text-slate-700">
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
                                    {t.desc}
                                </td>
                                <td className="py-4 px-4">
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">
                                        {t.category}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-slate-500 text-xs">
                                    {t.account}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        <span
                                            className={cn(
                                                'font-semibold',
                                                t.isIncome
                                                    ? 'text-emerald-500'
                                                    : 'text-slate-800',
                                            )}
                                        >
                                            {t.value}
                                        </span>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-xs font-medium cursor-pointer text-slate-400 hover:text-slate-700">
                                                Editar
                                            </button>
                                            <button className="text-xs font-medium cursor-pointer text-red-400 hover:text-red-600">
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between w-full gap-4 mt-6 pt-4 border-t border-slate-100">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={transactions.length}
                    itemsPerPage={5}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
