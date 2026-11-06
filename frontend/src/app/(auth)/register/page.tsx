'use client';

import { useRouter } from 'next/navigation';
import { RegisterForm } from './components/RegisterForm';
import { Button } from '@/src/components/ui/ButtonCustom';

export default function RegisterPage() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-8">
            <RegisterForm />

            <div className="relative w-full max-w-md py-6 text-center text-sm text-slate-400">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/legal/terms')}
                    className="h-auto p-0 text-slate-500 hover:text-primary-hover hover:bg-transparent"
                >
                    Termos de Uso
                </Button>

                <span className="text-slate-300">•</span>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/legal/privacy')}
                    className="h-auto p-0 text-slate-500 hover:text-primary-hover hover:bg-transparent"
                >
                    Política de Privacidade
                </Button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>
        </div>
    );
}
