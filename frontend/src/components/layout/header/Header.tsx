'use client';

import { MenuIcon, PlusIcon } from 'lucide-react';
import { Logo } from '../logo/Logo';
import { Button } from '../../ui/ButtonCustom';
import { headerVariants } from './Header.config';

interface HeaderProps {
    variant: keyof typeof headerVariants;
    firstName?: string;
    onAction?: () => void;
}

export function Header({ variant, firstName = '', onAction }: HeaderProps) {
    const config = headerVariants[variant];

    const resolvedTitle =
        typeof config.defaultTitle === 'function'
            ? config.defaultTitle(firstName)
            : config.defaultTitle;

    const resolvedSubtitle =
        typeof config.defaultSubtitle === 'function'
            ? config.defaultSubtitle(new Date())
            : config.defaultSubtitle;

    return (
        <header className="w-full bg-background/50 border-b border-gray-100">
            <div className="flex flex-col w-full mx-auto px-4 lg:px-8 py-2 gap-4">
                <div className="flex sm:hidden items-center justify-between">
                    <Logo variant="horizontal" size="md" />

                    <div className="flex items-center gap-2">
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-slate-600 hover:bg-gray-100 transition-colors">
                            <MenuIcon size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 md:mt-0">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl lg:text-4xl font-semibold text-slate-800 tracking-tight capitalize">
                            {resolvedTitle}
                        </h1>
                        <p className="text-sm lg:text-base text-slate-500">
                            {resolvedSubtitle}
                        </p>
                    </div>

                    {config.haveButton !== false && config.buttonTitle && (
                        <div className="hidden sm:flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                            <Button
                                variant="primary"
                                leftIcon={<PlusIcon size={18} />}
                                className="w-full md:w-auto h-12 rounded-xl text-sm font-semibold"
                                onClick={onAction}
                            >
                                {config.buttonTitle}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
