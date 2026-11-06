import { BottomBar } from '@/src/components/layout/bottomBar/BottomBar';
import { Sidebar } from '@/src/components/layout/sidebar/Sidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="relative flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 flex flex-col w-full min-h-screen pb-16 md:pb-0">
                <div className="flex-1 w-full mx-auto p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            <BottomBar />
        </div>
    );
}
