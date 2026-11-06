'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Moradia', value: 42.4, color: '#10b981' },
    { name: 'Alimentação', value: 23.5, color: '#3b82f6' },
    { name: 'Transporte', value: 10.6, color: '#a855f7' },
    { name: 'Lazer', value: 15.3, color: '#f59e0b' },
    { name: 'Saúde', value: 8.2, color: '#14b8a6' },
];

export function ExpensesDonutChart() {
    return (
        <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                    Despesas por categoria
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    Participação no total gasto em outubro
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 flex-1">
                <div className="relative h-40 w-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-slate-800">
                            R$ 4.250
                        </span>
                        <span className="text-[10px] text-slate-400">
                            total em despesas
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 w-full">
                    {data.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between text-xs"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-600 font-medium">
                                    {item.name}
                                </span>
                            </div>
                            <span className="text-slate-800 font-bold">
                                {item.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-50">
                Moradia representa 42,4% das despesas. É o maior compromisso do
                seu orçamento.
            </p>
        </div>
    );
}
