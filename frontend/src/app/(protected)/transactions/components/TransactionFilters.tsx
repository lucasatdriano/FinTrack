'use client';

import { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/src/components/form/TextInputForm';
import { Dropdown } from '@/src/components/form/DropdownInput';

export function TransactionFilters() {
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState('01 a 31 out. 2026');
    const [type, setType] = useState('Todos os tipos');
    const [category, setCategory] = useState('Todas as categorias');
    const [account, setAccount] = useState('Todas as contas');

    return (
        <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
            <Input
                label="Buscar transação"
                placeholder="Descrição ou palavra-chave"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<SearchIcon size={18} />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Dropdown
                    label="Período"
                    options={[
                        '01 a 31 out. 2026',
                        '01 a 31 set. 2026',
                        '01 a 31 ago. 2026',
                    ]}
                    value={period}
                    onChange={setPeriod}
                />
                <Dropdown
                    label="Tipo"
                    options={['Todos os tipos', 'Entradas', 'Saídas']}
                    value={type}
                    onChange={setType}
                />
                <Dropdown
                    label="Categoria"
                    options={[
                        'Todas as categorias',
                        'Trabalho',
                        'Alimentação',
                        'Saúde',
                        'Lazer',
                        'Transporte',
                        'Moradia',
                    ]}
                    value={category}
                    onChange={setCategory}
                />
                <Dropdown
                    label="Conta"
                    options={['Todas as contas', 'Nubank', 'Itaú', 'Carteira']}
                    value={account}
                    onChange={setAccount}
                />
            </div>
        </div>
    );
}
