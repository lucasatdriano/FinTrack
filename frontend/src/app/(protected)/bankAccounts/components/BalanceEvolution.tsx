const evolutionData = [
    {
        name: 'Nubank',
        initial: 'R$ 9.250,00',
        in: 'R$ 600,00',
        out: 'R$ 1.400,00',
        final: 'R$ 8.450,00',
    },
    {
        name: 'Itaú',
        initial: 'R$ 4.950,00',
        in: 'R$ 5.200,00',
        out: 'R$ 2.650,00',
        final: 'R$ 7.500,00',
    },
    {
        name: 'Carteira',
        initial: 'R$ 450,00',
        in: 'R$ 0,00',
        out: 'R$ 200,00',
        final: 'R$ 250,00',
    },
    {
        name: 'Poupança',
        initial: 'R$ 2.250,00',
        in: 'R$ 0,00',
        out: 'R$ 0,00',
        final: 'R$ 2.250,00',
    },
];

export function BalanceEvolution() {
    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
                Como seu saldo evoluiu
            </h2>
            <p className="text-sm text-slate-500 mb-8">
                Movimentações registradas de 1 a 28 de outubro de 2026
            </p>

            <div className="flex flex-col">
                {evolutionData.map((item, i) => (
                    <div
                        key={i}
                        className="flex flex-row justify-between py-5 border-b border-slate-300 last:border-0"
                    >
                        <div className="flex flex-col gap-1.5">
                            <div className="font-bold text-slate-800 text-sm">
                                {item.name}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                                <span className="text-slate-500">
                                    Inicial: {item.initial}
                                </span>
                                <span className="text-emerald-600 font-medium">
                                    Entradas: {item.in}
                                </span>
                                <span className="text-blue-500 font-medium">
                                    Saídas: {item.out}
                                </span>
                            </div>
                        </div>

                        <div className="font-bold text-slate-800 text-sm text-right shrink-0 ml-4">
                            {item.final}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
