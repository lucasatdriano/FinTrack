'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'CDB', value: 54.7, color: '#10b981' },
    { name: 'Tesouro', value: 30.4, color: '#3b82f6' },
    { name: 'Bitcoin', value: 14.9, color: '#f59e0b' },
];

export function AllocationChart() {
    return (
        <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-6">
                Onde seu dinheiro está
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 flex-1">
                <div className="relative h-48 w-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={65}
                                outerRadius={85}
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
                        <span className="text-xl font-bold text-slate-800">
                            R$ 32.900
                        </span>
                        <span className="text-[10px] text-slate-400">
                            total investido
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full sm:w-auto">
                    {data.map((item) => (
                        <div key={item.name} className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-slate-500">
                                {item.name}
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                                {item.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-6">
                Valores atualizados até 28 out. 2026.
            </p>
        </div>
    );
}
