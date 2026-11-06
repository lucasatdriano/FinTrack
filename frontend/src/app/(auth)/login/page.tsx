'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from './components/LoginForm';
import { Button } from '@/src/components/ui/ButtonCustom';

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <LoginForm />

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
        </div>
    );
}
