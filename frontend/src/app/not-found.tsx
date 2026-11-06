'use client';

import { useRouter } from 'next/navigation';
import { Logo } from '../components/layout/logo/Logo';
import { Button } from '../components/ui/ButtonCustom';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="mb-12">
                <Logo variant="horizontal" size="md" />
            </div>

            <div className="flex w-full max-w-md flex-col items-center text-center">
                <div className="mb-6">
                    <h1 className="text-8xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                        404
                    </h1>
                    <div className="h-1 w-20 mx-auto mt-2 bg-linear-to-r from-primary to-secondary rounded-full"></div>
                </div>

                <h1 className="mb-3 text-3xl font-bold text-slate-800 tracking-tight">
                    Página não encontrada
                </h1>
                <p className="mb-8 text-slate-500 text-base">
                    Parece que essa página não existe ou foi movida para outro
                    lugar. Que tal voltar para o painel principal?
                </p>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        onClick={() => router.push('/')}
                        variant="primary"
                        className="w-full sm:w-auto h-12 px-8"
                    >
                        Voltar para a página principal
                    </Button>
                </div>
            </div>
        </div>
    );
}
