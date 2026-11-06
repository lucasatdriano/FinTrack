'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheckIcon, ArrowRightIcon, RotateCwIcon } from 'lucide-react';
import { Logo } from '@/src/components/layout/logo/Logo';
import { Button } from '@/src/components/ui/ButtonCustom';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || 'lucas.adriano@email.com';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const [cooldown, setCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(
                () => setCooldown((prev) => prev - 1),
                1000,
            );
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (error) setError('');
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData('text')
            .slice(0, 6)
            .split('');
        if (pastedData.every((char) => !isNaN(Number(char)))) {
            const newCode = [...code];
            pastedData.forEach((char, i) => {
                if (i < 6) newCode[i] = char;
            });
            setCode(newCode);

            const nextEmptyIndex = newCode.findIndex((c) => c === '');
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');

        if (fullCode.length !== 6) {
            setError('Por favor, preencha todos os 6 dígitos.');
            return;
        }

        setIsVerifying(true);

        setTimeout(() => {
            setIsVerifying(false);
            router.push('/reset-password');
        }, 1500);
    };

    const handleResend = () => {
        if (cooldown > 0 || isResending) return;

        setIsResending(true);

        setTimeout(() => {
            setIsResending(false);
            setCooldown(30);
        }, 1000);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-8">
            <main className="w-full max-w-md bg-card rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex justify-center mb-6">
                    <Logo variant="horizontal" size="md" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Verifique seu e-mail
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                    Confirme seu endereço para proteger sua conta e continuar no
                    FinTrack.
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center mb-6">
                    <MailCheckIcon
                        className="text-emerald-500 mb-2"
                        size={28}
                    />
                    <p className="font-semibold text-slate-800 text-sm mb-1">
                        {email}
                    </p>
                    <p className="text-xs text-slate-500">
                        Procure a mensagem de confirmação na sua caixa de
                        entrada ou no spam.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-500">
                            Código de verificação
                        </label>
                        <div className="flex justify-between gap-2">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) =>
                                        handleChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={isVerifying}
                                    className="w-12 h-14 text-center text-xl font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                                />
                            ))}
                        </div>
                        {error && (
                            <span className="text-xs text-red-500 mt-1">
                                {error}
                            </span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-12 text-base font-semibold mt-2"
                        isLoading={isVerifying}
                        leftIcon={!isVerifying && <ArrowRightIcon size={18} />}
                        disabled={isVerifying}
                    >
                        Verificar código
                    </Button>
                </form>

                <div className="flex flex-col items-center justify-center mt-6 gap-2">
                    <p className="text-xs text-slate-500">
                        Não recebeu o código?
                    </p>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        onClick={handleResend}
                        disabled={cooldown > 0 || isResending}
                        isLoading={isResending}
                        leftIcon={!isResending && <RotateCwIcon size={16} />}
                    >
                        {cooldown > 0
                            ? `Reenviar em ${cooldown}s`
                            : 'Reenviar confirmação'}
                    </Button>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/login')}
                            className="h-auto p-0 text-primary-hover hover:bg-transparent"
                        >
                            Voltar para o login
                        </Button>

                        <span className="text-slate-300 text-sm">•</span>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/forgot-password')}
                            className="h-auto p-0 text-primary-hover hover:bg-transparent"
                        >
                            Usar outro e-mail
                        </Button>
                    </div>
                </div>
            </main>

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>
        </div>
    );
}
