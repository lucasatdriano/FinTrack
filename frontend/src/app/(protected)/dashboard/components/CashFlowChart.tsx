'use client';

import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { CustomChartTooltip } from '@/src/components/ui/tooltip/ChartTooltip';

const allData = [
    { name: 'Nov/24', receitas: 4200, despesas: 3100 },
    { name: 'Dez/24', receitas: 5800, despesas: 4500 },
    { name: 'Jan/25', receitas: 4500, despesas: 3500 },
    { name: 'Fev/25', receitas: 4700, despesas: 3600 },
    { name: 'Mar/25', receitas: 4600, despesas: 3800 },
    { name: 'Abr/25', receitas: 4900, despesas: 3900 },
    { name: 'Mai/25', receitas: 5000, despesas: 3800 },
    { name: 'Jun/25', receitas: 5200, despesas: 4000 },
    { name: 'Jul/25', receitas: 4800, despesas: 3900 },
    { name: 'Ago/25', receitas: 5500, despesas: 4200 },
    { name: 'Set/25', receitas: 5100, despesas: 4100 },
    { name: 'Out/25', receitas: 5800, despesas: 4250 },
    { name: 'Nov/25', receitas: 6000, despesas: 4400 },
    { name: 'Dez/25', receitas: 7200, despesas: 5100 },
    { name: 'Jan/26', receitas: 5400, despesas: 4200 },
    { name: 'Fev/26', receitas: 5300, despesas: 4100 },
    { name: 'Mar/26', receitas: 5600, despesas: 4300 },
    { name: 'Abr/26', receitas: 5900, despesas: 4500 },
    { name: 'Mai/26', receitas: 6100, despesas: 4600 },
    { name: 'Jun/26', receitas: 6300, despesas: 4750 },
    { name: 'Jul/26', receitas: 5900, despesas: 4600 },
    { name: 'Ago/26', receitas: 6600, despesas: 4900 },
    { name: 'Set/26', receitas: 6200, despesas: 6800 },
    { name: 'Out/26', receitas: 6900, despesas: 5000 },
];

export function CashFlowChart() {
    const [monthsFilter, setMonthsFilter] = useState<number>(6);

    const filteredData = allData.slice(-monthsFilter);

    const minWidth = filteredData.length * 65;

    return (
        <RadixTooltip.Provider>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-100 w-full select-none">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">
                        Receitas x Despesas
                    </h2>
                    <select
                        value={monthsFilter}
                        onChange={(e) =>
                            setMonthsFilter(Number(e.target.value))
                        }
                        className="text-sm text-slate-500 bg-transparent outline-none cursor-pointer border border-slate-200 rounded-lg px-2 py-1 hover:border-slate-300 transition-colors"
                    >
                        <option value={24}>Últimos 24 meses</option>
                        <option value={12}>Últimos 12 meses</option>
                        <option value={6}>Últimos 6 meses</option>
                        <option value={3}>Últimos 3 meses</option>
                    </select>
                </div>

                <div className="flex-1 w-full overflow-x-auto overflow-y-hidden pb-3 relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <div
                        style={{
                            width: monthsFilter <= 6 ? '100%' : `${minWidth}px`,
                            height: '100%',
                        }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={filteredData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 40,
                                    bottom: 35,
                                }}
                                barGap={5}
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
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    dy={10}
                                />

                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={<CustomChartTooltip />}
                                />

                                <Bar
                                    dataKey="receitas"
                                    name="Receitas"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                    barSize={16}
                                />
                                <Bar
                                    dataKey="despesas"
                                    name="Despesas"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={16}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="sticky h-full left-0 top-0 bottom-3 w-20 bg-linear-to-r from-white via-white to-transparent pointer-events-none z-10 flex items-stretch">
                        <div className="w-13 bg-white h-[76%] flex flex-col justify-between pt-3 pb-3 text-[11px] font-medium text-slate-400 pl-2">
                            <span>8.000</span>
                            <span>6.000</span>
                            <span>4.000</span>
                            <span>2.000</span>
                            <span className="translate-y-1">0</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-6 mt-4 pt-2 border-t border-slate-50 text-xs font-medium text-slate-600 select-none">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>Receitas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Despesas</span>
                    </div>
                </div>
            </div>
        </RadixTooltip.Provider>
    );
}
