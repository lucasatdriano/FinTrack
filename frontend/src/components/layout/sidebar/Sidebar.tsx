'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
    SproutIcon,
    ArrowRightIcon,
    LogOutIcon,
    ChevronLeftIcon,
} from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { Logo } from '../logo/Logo';
import { sidebarItems } from './Sidebar.config';

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setIsCollapsed(true);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <aside
            className={cn(
                'hidden sm:flex h-screen sticky z-50 top-0 flex-col bg-card border-r border-gray-100 transition-all duration-300 ease-in-out shrink-0',
                isCollapsed ? 'w-20' : 'w-72',
            )}
        >
            <div
                className={cn(
                    'flex h-20 items-center px-6',
                    isCollapsed ? 'justify-center px-0' : 'justify-between',
                )}
            >
                {!isCollapsed ? (
                    <Logo variant="horizontal" size="md" />
                ) : (
                    <Logo variant="icon" size="md" />
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex cursor-pointer text-gray-400 hover:text-gray-600"
                >
                    <ChevronLeftIcon
                        size={18}
                        className={cn(
                            'transition-transform',
                            isCollapsed && 'rotate-180',
                        )}
                    />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
                {!isCollapsed && (
                    <span className="px-2 mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        Seu espaço financeiro
                    </span>
                )}

                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors group relative',
                                isActive
                                    ? 'bg-emerald-50 text-primary-hover'
                                    : 'text-slate-500 hover:bg-gray-50 hover:text-slate-800',
                                isCollapsed && 'justify-center px-0',
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon
                                size={22}
                                className={cn(
                                    isActive
                                        ? 'text-primary'
                                        : 'text-slate-400 group-hover:text-slate-600',
                                )}
                            />

                            {!isCollapsed && (
                                <span className="flex-1">{item.label}</span>
                            )}

                            {isActive && !isCollapsed && (
                                <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 flex flex-col gap-4 border-t border-gray-100">
                {!isCollapsed && (
                    <div className="bg-background border-2 border-gray-100 p-5 rounded-2xl flex flex-col gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-background flex items-center justify-center text-primary-hover">
                            <SproutIcon size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Pequenos passos, grandes planos.
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Revisar seu orçamento é cuidar do seu futuro.
                            </p>
                        </div>
                        <Link
                            href="/budget"
                            className="text-sm font-semibold text-primary-hover flex items-center gap-1 hover:text-primary-hover transition-colors mt-1"
                        >
                            Meu planejamento <ArrowRightIcon size={16} />
                        </Link>
                    </div>
                )}

                <Link
                    href="/profile"
                    className={cn(
                        'flex items-center gap-3 pt-4 border-t border-gray-100 cursor-pointer hover:bg-slate-50 transition-colors',
                        isCollapsed ? 'justify-center' : 'justify-between',
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-background text-primary-hover flex items-center justify-center font-semibold text-sm shrink-0">
                            LA
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800">
                                    Lucas Adriano
                                </span>
                                <span className="text-xs text-slate-500">
                                    Conta pessoal
                                </span>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                            className="cursor-pointer text-slate-400 hover:text-slate-600 z-10"
                        >
                            <LogOutIcon size={18} />
                        </button>
                    )}
                </Link>
            </div>
        </aside>
    );
}
