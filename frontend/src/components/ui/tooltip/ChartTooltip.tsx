interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

export function CustomChartTooltip({
    active,
    payload,
    label,
}: CustomTooltipProps) {
    if (!active || !payload || !payload.length) return null;

    const receitas = payload[0].value;
    const despesas = payload[1].value;
    const total = receitas - despesas;
    const isNegative = total < 0;

    return (
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-lg text-xs flex flex-col gap-1.5 min-w-36 select-none animate-in fade-in zoom-in-95 duration-100">
            <p className="font-bold text-slate-700 border-b border-slate-50 pb-1 mb-0.5">
                {label}
            </p>
            <div className="flex justify-between items-center gap-4 text-slate-600">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Receitas:
                </span>
                <span className="font-semibold text-slate-800">
                    {receitas.toLocaleString('pt-BR')}
                </span>
            </div>
            <div className="flex justify-between items-center gap-4 text-slate-600">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Despesas:
                </span>
                <span className="font-semibold text-slate-800">
                    {despesas.toLocaleString('pt-BR')}
                </span>
            </div>
            <div className="flex justify-between items-center gap-4 border-t border-slate-100 pt-1.5 mt-0.5">
                <span className="font-medium text-slate-500">Total:</span>
                <span
                    className={`font-bold ${isNegative ? 'text-red-600' : 'text-emerald-800'}`}
                >
                    {isNegative ? '' : '+'}
                    {total.toLocaleString('pt-BR')}
                </span>
            </div>
        </div>
    );
}
