import { WalletIcon } from 'lucide-react';
import { cn } from '@/src/utils/cn';

const accounts = [
    {
        name: 'Nubank',
        type: 'Conta corrente',
        balance: 'R$ 8.450,00',
        info: 'Ag. 0001 · Conta •••• 4821',
        iconLetter: 'Nu',
        iconBg: 'bg-purple-50',
        iconText: 'text-purple-600',
        topIconColor: 'text-purple-600',
    },
    {
        name: 'Itaú',
        type: 'Conta corrente',
        balance: 'R$ 7.500,00',
        info: 'Ag. 1432 · Conta •••• 9087',
        iconLetter: 'I',
        iconBg: 'bg-orange-50',
        iconText: 'text-orange-600',
        topIconColor: 'text-orange-600',
    },
    {
        name: 'Santander',
        type: 'Conta corrente',
        balance: 'R$ 7.500,00',
        info: 'Ag. 1432 · Conta •••• 9087',
        iconLetter: 'S',
        iconBg: 'bg-red-50',
        iconText: 'text-red-600',
        topIconColor: 'text-red-600',
    },
    {
        name: 'Carteira',
        type: 'Dinheiro em espécie',
        balance: 'R$ 250,00',
        info: 'Saldo atualizado manualmente',
        iconLetter: '$',
        iconBg: 'bg-emerald-50',
        iconText: 'text-emerald-600',
        topIconColor: 'text-emerald-600',
    },
    {
        name: 'Poupança',
        type: 'Reserva de emergência',
        balance: 'R$ 2.250,00',
        info: 'Itaú · Conta •••• 3025',
        iconLetter: 'P',
        iconBg: 'bg-blue-50',
        iconText: 'text-blue-600',
        topIconColor: 'text-blue-600',
    },
];

export function AccountList() {
    return (
        <div className="w-full flex flex-wrap gap-4">
            {accounts.map((acc, i) => (
                <div
                    key={i}
                    className="flex-1 min-w-70 bg-card rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between"
                >
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className={cn(
                                    'h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg',
                                    acc.iconBg,
                                    acc.iconText,
                                )}
                            >
                                {acc.iconLetter}
                            </div>
                            <WalletIcon
                                size={18}
                                className={acc.topIconColor}
                            />
                        </div>

                        <h3 className="text-base font-bold text-slate-800">
                            {acc.name}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            {acc.type}
                        </p>

                        <p className="text-xs font-medium text-slate-400 mb-1">
                            Saldo disponível
                        </p>
                        <h4 className="text-2xl font-bold text-slate-800 mb-3">
                            {acc.balance}
                        </h4>
                        <p className="text-[11px] text-slate-400">{acc.info}</p>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 -mx-5 px-5">
                        <button className="text-xs font-medium cursor-pointer text-slate-500 hover:text-slate-800 transition-colors">
                            Editar
                        </button>
                        <button className="text-xs font-medium cursor-pointer text-red-500 hover:text-red-700 transition-colors">
                            Excluir
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
