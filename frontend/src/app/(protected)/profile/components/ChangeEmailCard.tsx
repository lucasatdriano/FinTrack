'use client';

import { useState } from 'react';
import { MailIcon } from 'lucide-react';
import { Input } from '@/src/components/form/TextInputForm';
import { Button } from '@/src/components/ui/ButtonCustom';

export function ChangeEmailCard() {
    const [email, setEmail] = useState('lucas.adriano@email.com');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    return (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
                Alterar e-mail
            </h2>
            <p className="text-sm text-slate-500 mb-6">
                Atualize seu e-mail de acesso. Enviaremos um link de
                confirmação.
            </p>

            <form
                onSubmit={handleUpdateEmail}
                className="flex flex-col gap-4 max-w-md"
            >
                <Input
                    label="Novo e-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<MailIcon size={18} />}
                />

                <Input
                    label="Senha atual"
                    type="password"
                    placeholder="Digite sua senha para confirmar"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    type="submit"
                    variant="primary"
                    className="w-fit mt-2"
                    isLoading={isLoading}
                >
                    Atualizar e-mail
                </Button>
            </form>
        </div>
    );
}
