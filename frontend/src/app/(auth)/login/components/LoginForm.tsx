'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MailIcon, LockIcon, LogInIcon } from 'lucide-react';
import { Input } from '@/src/components/form/TextInputForm';
import { Logo } from '@/src/components/layout/logo/Logo';
import { Button } from '@/src/components/ui/ButtonCustom';

export function LoginForm() {
    const router = useRouter();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let hasError = false;
        const newErrors = { email: '', password: '' };

        if (!formData.email) {
            newErrors.email = 'O e-mail é obrigatório.';
            hasError = true;
        }
        if (!formData.password) {
            newErrors.password = 'A senha é obrigatória.';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setIsLoggingIn(true);

        setTimeout(() => {
            setIsLoggingIn(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <main className="w-full max-w-md bg-card rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-center mb-6">
                <Logo variant="vertical" size="md" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
                Entre na sua conta
            </h2>
            <p className="text-slate-500 text-sm mb-8 text-center">
                Bom te ver por aqui. Vamos cuidar das suas finanças?
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="E-mail"
                    type="email"
                    placeholder="lucas.adriano@email.com"
                    value={formData.email}
                    onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email)
                            setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    leftIcon={<MailIcon size={18} />}
                    error={errors.email}
                    disabled={isLoggingIn}
                />

                <Input
                    label="Senha"
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password)
                            setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    leftIcon={<LockIcon size={18} />}
                    error={errors.password}
                    disabled={isLoggingIn}
                />

                <div className="flex justify-end -mt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/forgot-password')}
                        disabled={isLoggingIn}
                        className="h-auto p-0 text-xs text-slate-500 hover:bg-transparent hover:text-primary-hover"
                    >
                        Esqueci minha senha
                    </Button>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-12 text-base font-semibold mt-2"
                    isLoading={isLoggingIn}
                    leftIcon={!isLoggingIn && <LogInIcon size={18} />}
                    disabled={isLoggingIn}
                >
                    {isLoggingIn ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>

            <p className="text-center mt-8 text-sm text-slate-500">
                Ainda não tem uma conta?{' '}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/register')}
                    disabled={isLoggingIn}
                    className="h-auto p-0 text-sm font-semibold text-primary-hover hover:bg-transparent"
                >
                    Criar conta
                </Button>
            </p>
        </main>
    );
}
