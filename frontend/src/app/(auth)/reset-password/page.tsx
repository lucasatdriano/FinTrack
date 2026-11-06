'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyIcon, SaveIcon } from 'lucide-react';
import { Input } from '@/src/components/form/TextInputForm';
import { Logo } from '@/src/components/layout/logo/Logo';
import { Button } from '@/src/components/ui/ButtonCustom';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let hasError = false;
        const newErrors = { password: '', confirmPassword: '' };

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

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setIsSaving(true);

        setTimeout(() => {
            setIsSaving(false);
            router.push('/login');
        }, 1500);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-8">
            <main className="w-full max-w-md bg-card rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex justify-center mb-6">
                    <Logo variant="horizontal" size="md" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Redefinir senha
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                    Escolha uma senha forte e diferente da anterior.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nova senha"
                        type="password"
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            });
                            if (errors.password)
                                setErrors((prev) => ({
                                    ...prev,
                                    password: '',
                                }));
                        }}
                        leftIcon={<KeyIcon size={18} />}
                        error={errors.password}
                        disabled={isSaving}
                    />

                    <Input
                        label="Confirmar nova senha"
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
                        leftIcon={<KeyIcon size={18} />}
                        error={errors.confirmPassword}
                        disabled={isSaving}
                    />

                    <p className="text-xs text-slate-500 leading-relaxed pt-2">
                        Use pelo menos 8 caracteres, incluindo letras e números.
                        O link de recuperação expira em 1 hora.
                    </p>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-12 text-base font-semibold mt-2"
                        isLoading={isSaving}
                        leftIcon={!isSaving && <SaveIcon size={18} />}
                        disabled={isSaving}
                    >
                        Salvar nova senha
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
