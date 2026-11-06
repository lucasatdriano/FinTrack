'use client';

import { useState } from 'react';
import { Input } from '@/src/components/form/TextInputForm';
import { Button } from '@/src/components/ui/ButtonCustom';

export function ChangePasswordCard() {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
                Alterar senha
            </h2>
            <p className="text-sm text-slate-500 mb-6">
                Atualize sua senha de acesso. Enviaremos um link de confirmação.
            </p>

            <form
                onSubmit={handleUpdatePassword}
                className="flex flex-col gap-4"
            >
                <Input
                    label="Senha atual"
                    type="password"
                    placeholder="••••••••••••"
                />

                <div>
                    <Input
                        label="Nova senha"
                        type="password"
                        placeholder="••••••••••••"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        Use pelo menos 8 caracteres, letras e números.
                    </p>
                </div>

                <Input
                    label="Confirmar nova senha"
                    type="password"
                    placeholder="••••••••••••"
                />

                <Button
                    type="submit"
                    variant="primary"
                    className="w-fit mt-2"
                    isLoading={isLoading}
                >
                    Atualizar senha
                </Button>
            </form>
        </div>
    );
}
