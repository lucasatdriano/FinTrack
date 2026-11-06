import { PlusIcon } from 'lucide-react';
import { Button } from '@/src/components/ui/ButtonCustom';

const categories = [
    { name: 'Moradia', type: 'Despesa' },
    { name: 'Alimentação', type: 'Despesa' },
    { name: 'Transporte', type: 'Despesa' },
    { name: 'Lazer', type: 'Despesa' },
    { name: 'Saúde', type: 'Despesa' },
    { name: 'Trabalho', type: 'Receita' },
];

export function CategoryManager() {
    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-1">
                        Gerenciar categorias
                    </h2>
                    <p className="text-sm text-slate-500">
                        Organize seus lançamentos sem perder o histórico.
                    </p>
                </div>
            </div>

            <div className="flex flex-col mt-6">
                {categories.map((cat, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0"
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                {cat.name}
                            </p>
                            <p className="text-xs text-slate-400">{cat.type}</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="text-xs font-medium cursor-pointer text-slate-500 hover:text-slate-800">
                                Editar
                            </button>
                            <button className="text-xs font-medium cursor-pointer text-red-500 hover:text-red-700">
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                variant="primary"
                leftIcon={<PlusIcon size={18} />}
                className="mt-6 w-fit"
            >
                Nova categoria
            </Button>
        </div>
    );
}
