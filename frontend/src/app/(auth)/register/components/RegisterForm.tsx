'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, MailIcon, LockIcon, UserPlusIcon } from 'lucide-react';
import { Input } from '@/src/components/form/TextInputForm';
import { Logo } from '@/src/components/layout/logo/Logo';
import { Button } from '@/src/components/ui/ButtonCustom';
import { Checkbox } from '@/src/components/form/CheckboxInput';

export function RegisterForm() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: '',
    });

    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let hasError = false;
        const newErrors = {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            acceptTerms: '',
        };

        if (!formData.name) {
            newErrors.name = 'O nome é obrigatório.';
            hasError = true;
        }
        if (!formData.email) {
            newErrors.email = 'O e-mail é obrigatório.';
            hasError = true;
        }
        if (!formData.phone) {
            newErrors.phone = 'O telefone é obrigatório.';
            hasError = true;
        }
        if (!formData.password) {
            newErrors.password = 'A senha é obrigatória.';
            hasError = true;
        } else if (formData.password.length < 8) {
            newErrors.password = 'A senha deve ter no mínimo 8 caracteres.';
            hasError = true;
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem.';
            hasError = true;
        }
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'É necessário aceitar os termos.';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setIsRegistering(true);
        setTimeout(() => {
            setIsRegistering(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <main className="w-full max-w-md bg-card rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-center mb-6">
                <Logo variant="vertical" size="md" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
                Crie sua conta
            </h2>
            <p className="text-slate-500 text-sm mb-8 text-center">
                Seu primeiro passo para uma vida financeira mais leve.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nome completo"
                    type="text"
                    placeholder="Lucas Adriano"
                    value={formData.name}
                    onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name)
                            setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    leftIcon={<UserIcon size={18} />}
                    error={errors.name}
                    disabled={isRegistering}
                />

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
                    disabled={isRegistering}
                />

                <Input
                    label="Telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone)
                            setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    leftIcon={<MailIcon size={18} />}
                    error={errors.phone}
                    disabled={isRegistering}
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
                    disabled={isRegistering}
                />

                <Input
                    label="Confirmar senha"
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                        setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                        });
                        if (errors.confirmPassword)
                            setErrors((prev) => ({
                                ...prev,
                                confirmPassword: '',
                            }));
                    }}
                    leftIcon={<LockIcon size={18} />}
                    error={errors.confirmPassword}
                    disabled={isRegistering}
                />

                <div className="pt-2">
                    <Checkbox
                        label="Li e aceito os Termos de uso e a Política de privacidade."
                        checked={formData.acceptTerms}
                        onChange={(checked) => {
                            setFormData({ ...formData, acceptTerms: checked });
                            if (errors.acceptTerms)
                                setErrors((prev) => ({
                                    ...prev,
                                    acceptTerms: '',
                                }));
                        }}
                        error={errors.acceptTerms}
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-12 text-base font-semibold mt-4"
                    isLoading={isRegistering}
                    leftIcon={!isRegistering && <UserPlusIcon size={18} />}
                    disabled={isRegistering}
                >
                    {isRegistering ? 'Criando conta...' : 'Criar conta'}
                </Button>
            </form>

            <p className="text-center mt-6 text-sm text-slate-500">
                Já tem uma conta?{' '}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/login')}
                    disabled={isRegistering}
                    className="h-auto p-0 text-sm font-semibold text-primary-hover hover:bg-transparent"
                >
                    Entrar
                </Button>
            </p>
        </main>
    );
}
