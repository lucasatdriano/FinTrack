'use client';

import { Header } from '@/src/components/layout/header/Header';
import { ProfileForm } from './components/ProfileForm';
import { ChangeEmailCard } from './components/ChangeEmailCard';
import { CategoryManager } from './components/CategoryManager';
import { ChangePasswordCard } from './components/ChangePasswordCard';
import { SecurityForm } from './components/securityForm';

export default function ProfilePage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <Header variant="profile" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-6">
                    <ProfileForm />
                    <CategoryManager />
                </div>

                <div className="flex flex-col gap-6">
                    <ChangeEmailCard />
                    <SecurityForm />
                    <ChangePasswordCard />
                </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">
                Suas finanças, só suas. • 28 out. 2026, às 09:41
            </p>
        </div>
    );
}
