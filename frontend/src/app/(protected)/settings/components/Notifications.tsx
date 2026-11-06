'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/ButtonCustom';
import { Toggle } from '@/src/components/form/ToggleInput';

export function Notifications() {
    const [settings, setSettings] = useState({
        budgetAlerts: true,
        monthlySummary: true,
        newsAndTips: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <div className="bg-card xl:col-span-2 rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
                Notificações
            </h2>
            <p className="text-sm text-slate-500 mb-8">
                Receba o que importa, sem excessos
            </p>

            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            Alertas de orçamento
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Avise quando uma categoria atingir ou exceder o
                            limite.
                        </p>
                    </div>

                    <Toggle
                        checked={settings.budgetAlerts}
                        onChange={() =>
                            setSettings({
                                ...settings,
                                budgetAlerts: !settings.budgetAlerts,
                            })
                        }
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            Resumo mensal por e-mail
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Seu fechamento financeiro, no início de cada mês.
                        </p>
                    </div>
                    <Toggle
                        checked={settings.monthlySummary}
                        onChange={() =>
                            setSettings({
                                ...settings,
                                monthlySummary: !settings.monthlySummary,
                            })
                        }
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            Novidades e dicas
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Conteúdos e novidades sobre o FinTrack.
                        </p>
                    </div>
                    <Toggle
                        checked={settings.newsAndTips}
                        onChange={() =>
                            setSettings({
                                ...settings,
                                newsAndTips: !settings.newsAndTips,
                            })
                        }
                    />
                </div>
            </div>

            <Button
                onClick={handleSave}
                variant="primary"
                className="mt-8 w-fit"
                isLoading={isLoading}
            >
                Salvar preferências
            </Button>
        </div>
    );
}
