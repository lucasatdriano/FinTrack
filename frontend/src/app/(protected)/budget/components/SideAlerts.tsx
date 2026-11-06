export function SideAlerts() {
    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 shadow-sm">
                <h3 className="text-base font-bold text-red-600 mb-3">
                    Atenção ao lazer
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Você gastou R$ 650,00 de um limite de R$ 500,00. A categoria
                    está R$ 150,00 acima do planejado.
                </p>
                <span className="text-xs font-bold text-red-500 bg-red-100/50 px-2 py-1 rounded-md">
                    130% do limite utilizado
                </span>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
                <h3 className="text-base font-bold text-slate-800 mb-5">
                    Ainda cabe no seu mês
                </h3>

                <div className="flex flex-col gap-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Alimentação</span>
                        <span className="font-bold text-slate-800">
                            R$ 200,00
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Transporte</span>
                        <span className="font-bold text-slate-800">
                            R$ 150,00
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Saúde</span>
                        <span className="font-bold text-slate-800">
                            R$ 150,00
                        </span>
                    </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                    Moradia atingiu o limite. O excesso em Lazer reduz sua
                    margem total para R$ 350,00.
                </p>
            </div>
        </div>
    );
}
