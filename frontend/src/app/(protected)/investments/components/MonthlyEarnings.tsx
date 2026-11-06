'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
    LabelList,
} from 'recharts';

const data = [
    { name: 'Mai', value: 230 },
    { name: 'Jun', value: 240 },
    { name: 'Jul', value: 180 },
    { name: 'Ago', value: 270 },
    { name: 'Set', value: 210 },
    { name: 'Out', value: 200 },
];

export function MonthlyEarnings() {
    return (
        <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
                Seu dinheiro trabalhando
            </h2>
            <p className="text-xs text-slate-500 mb-8">
                Rendimento líquido da carteira, em reais · 2026
            </p>

            <div className="flex-1 w-full min-h-50">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                    >
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis hide={true} />
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        >
                            <LabelList
                                dataKey="value"
                                position="top"
                                formatter={(val: number) =>
                                    `R$ ${val.toFixed(2)}`
                                }
                                style={{
                                    fill: '#64748b',
                                    fontSize: 10,
                                    fontWeight: 500,
                                }}
                            />
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        index === data.length - 1
                                            ? '#10b981'
                                            : '#a7f3d0'
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
