'use client';

import { useState } from 'react';
import { MonitorIcon } from 'lucide-react';
import { Toggle } from '@/src/components/form/ToggleInput';

export function SecurityForm() {
    const [is2FAEnabled, setIs2FAEnabled] = useState(true);

    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Segurança</h2>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div>
                    <p className="font-semibold text-slate-800 text-sm">
                        Autenticação em duas etapas
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Uma camada extra de proteção ao entrar.
                    </p>
                </div>

                <Toggle
                    checked={is2FAEnabled}
                    onChange={() => setIs2FAEnabled(!is2FAEnabled)}
                />
            </div>

            <p className="flex items-center gap-2 text-xs text-slate-400">
                <MonitorIcon size={18} /> Sessão atual · Chrome, São Paulo
            </p>
        </div>
    );
}
