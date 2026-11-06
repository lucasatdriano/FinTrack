'use client';

import { Header } from '@/src/components/layout/header/Header';
import { GeneralPreferences } from './components/GeneralPreferences';
import { Notifications } from './components/Notifications';

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <Header variant="settings" />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                <Notifications />
                <GeneralPreferences />
            </div>

            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>
        </div>
    );
}
