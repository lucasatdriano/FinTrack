'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/utils/cn';
import { bottomBarItems } from './BottomBar.config';

export function BottomBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-gray-100 bg-card pb-safe sm:hidden">
            {bottomBarItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center justify-center w-full h-full gap-1"
                    >
                        <item.icon
                            size={20}
                            className={cn(
                                'transition-colors',
                                isActive ? 'text-primary' : 'text-slate-400',
                            )}
                        />
                        <span
                            className={cn(
                                'text-[10px] font-medium transition-colors',
                                isActive ? 'text-primary' : 'text-slate-500',
                            )}
                        >
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
