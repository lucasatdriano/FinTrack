'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MailIcon, SendIcon } from 'lucide-react';
import { Input } from '@/src/components/form/TextInputForm';
import { Logo } from '@/src/components/layout/logo/Logo';
import { Button } from '@/src/components/ui/ButtonCustom';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('O e-mail é obrigatório.');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-8">
            <main className="w-full max-w-md bg-card rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex justify-center mb-6">
                    <Logo variant="horizontal" size="md" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Esqueci minha senha
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                    Informe seu e-mail para solicitar um link de redefinição de
                    senha.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="E-mail"
                        type="email"
                        placeholder="lucas.adriano@email.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError('');
                        }}
                        leftIcon={<MailIcon size={18} />}
                        error={error}
                        disabled={isLoading}
                    />

                    <p className="text-xs text-slate-500 leading-relaxed">
                        Se existir uma conta com esse e-mail, você poderá
                        receber as instruções de recuperação. Confira também o
                        spam.
                    </p>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-12 text-base font-semibold mt-2"
                        isLoading={isLoading}
                        leftIcon={!isLoading && <SendIcon size={18} />}
                        disabled={isLoading}
                    >
                        Solicitar redefinição
                    </Button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-500">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/login')}
                        className="text-primary-hover hover:text-primary-hover hover:bg-transparent px-2"
                    >
                        Voltar para o login
                    </Button>
                </p>
            </main>

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>
        </div>
    );
}
