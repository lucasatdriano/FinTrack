'use client';

import { ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

interface TooltipProps {
    children: ReactNode;
    text: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
    children,
    text,
    side = 'top',
    align = 'center',
    delayDuration = 200,
    isOpen,
    onOpenChange,
}: TooltipProps) {
    return (
        <RadixTooltip.Provider delayDuration={delayDuration}>
            <RadixTooltip.Root open={isOpen} onOpenChange={onOpenChange}>
                <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>

                <RadixTooltip.Portal>
                    <RadixTooltip.Content
                        side={side}
                        align={align}
                        sideOffset={6}
                        className="bg-white rounded-lg p-3 border border-slate-100 shadow-lg text-xs flex flex-col gap-1.5 min-w-35 z-100 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-100 text-slate-700 font-medium"
                    >
                        {text}
                        <RadixTooltip.Arrow className="fill-white stroke-slate-100" />
                    </RadixTooltip.Content>
                </RadixTooltip.Portal>
            </RadixTooltip.Root>
        </RadixTooltip.Provider>
    );
}
