'use client';

import { useState } from 'react';
import { Dropdown } from '@/src/components/form/DropdownInput';

export function GeneralPreferences() {
    const [currency, setCurrency] = useState('Real brasileiro · BRL (R$)');
    const [timezone, setTimezone] = useState('Brasília (GMT-03:00)');

    const currencyOptions = [
        'Real brasileiro · BRL (R$)',
        'Dólar americano · USD ($)',
        'Euro · EUR (€)',
    ];

    const timezoneOptions = [
        'Brasília (GMT-03:00)',
        'Manaus (GMT-04:00)',
        'Fernando de Noronha (GMT-02:00)',
    ];

    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
                Preferências gerais
            </h2>
            <p className="text-sm text-slate-500 mb-6">
                Usadas em todas as suas finanças
            </p>

            <div className="flex flex-col gap-5">
                <Dropdown
                    label="Moeda principal"
                    options={currencyOptions}
                    value={currency}
                    onChange={setCurrency}
                />

                <Dropdown
                    label="Fuso horário"
                    options={timezoneOptions}
                    value={timezone}
                    onChange={setTimezone}
                />

                <p className="text-xs text-slate-400 mt-2">
                    Formato de data: DD/MM/AAAA
                </p>
            </div>
        </div>
    );
}
