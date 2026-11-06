'use client';

import { CustomChartTooltip } from '@/src/components/ui/tooltip/ChartTooltip';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const data = [
    { name: 'Mai', receitas: 5000, despesas: 3800 },
    { name: 'Jun', receitas: 5200, despesas: 4000 },
    { name: 'Jul', receitas: 4800, despesas: 3900 },
    { name: 'Ago', receitas: 5500, despesas: 4200 },
    { name: 'Set', receitas: 5100, despesas: 4100 },
    { name: 'Out', receitas: 5800, despesas: 4250 },
];

export function CashFlowChart() {
    return (
        <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Receitas x Despesas
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Evolução de maio a outubro de 2026
                    </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    Mensal
                </span>
            </div>

            <div className="flex-1 w-full min-h-62">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                        barGap={4}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />

                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={<CustomChartTooltip />}
                        />

                        <Legend
                            iconType="circle"
                            wrapperStyle={{
                                fontSize: '12px',
                                paddingTop: '20px',
                            }}
                        />
                        <Bar
                            dataKey="receitas"
                            name="Receitas"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={30}
                        />
                        <Bar
                            dataKey="despesas"
                            name="Despesas"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 border-t border-slate-50 pt-4">
                No semestre: R$ 32.600,00 em receitas e R$ 25.100,00 em
                despesas.
            </p>
        </div>
    );
}
