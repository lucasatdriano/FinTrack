'use client';

import { useState } from 'react';
import { MailIcon, CheckIcon } from 'lucide-react';
import { Input } from '@/src/components/form/TextInputForm';
import { Button } from '@/src/components/ui/ButtonCustom';

export function ProfileForm() {
    const [formData, setFormData] = useState({
        name: 'Lucas Adriano',
        phone: '(11) 99984-2026',
        email: 'lucas.adriano@email.com',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6">
                Dados pessoais
            </h2>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
                        LA
                    </div>
                    <span className="font-semibold text-slate-800">
                        {formData.name}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
                <Input
                    label="Nome completo"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                />

                <Input
                    label="Telefone"
                    value={formData.phone}
                    onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                    }
                />

                <div>
                    <Input
                        label="E-mail"
                        value={formData.email}
                        readOnly
                        disabled
                        leftIcon={<MailIcon size={18} />}
                        className="bg-slate-50 cursor-not-allowed"
                    />
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                        <CheckIcon size={14} className="text-emerald-500" />{' '}
                        E-mail verificado
                    </span>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-fit mt-2"
                    isLoading={isLoading}
                >
                    Salvar perfil
                </Button>
            </form>
        </div>
    );
}
