import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import '@daypicker/react/style.css';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Fintrack - Controle Financeiro',
    description: 'Controle suas finanças pessoais com segurança.',
    authors: [{ name: 'Lucas Adriano' }],
    keywords: [
        'FinTrack',
        'Finanças Pessoais',
        'Next.js',
        'NestJs',
        'TypeScript',
        'Finanças',
        'Controle Financeiro',
    ],
    icons: {
        icon: '../../public/icons/logo-finTrack.svg',
        // icon: '/icons/logo-finTrack.svg',
    },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html
            suppressHydrationWarning
            lang="pt-br"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                {children}
                <Toaster richColors position="top-right" />
            </body>
        </html>
    );
}
