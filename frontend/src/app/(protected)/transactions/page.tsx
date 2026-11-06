'use client';

import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { Header } from '@/src/components/layout/header/Header';
import { Fab } from '@/src/components/ui/FabButton';

import { TransactionFilters } from './components/TransactionFilters';
import { TransactionTable } from './components/TransactionTable';

export default function TransacoesPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6 w-full">
            <Header
                variant="transactions"
                onAction={() => router.push('/transacoes/nova')}
            />

            <TransactionFilters />
            <TransactionTable />

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>

            <div className="sm:hidden">
                <Fab
                    icon={<PlusIcon size={24} />}
                    toolTipText="Nova Transação"
                    onClick={() => router.push('/transacoes/nova')}
                />
            </div>
        </div>
    );
}
