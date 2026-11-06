'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/utils/cn';
import { Tooltip } from './tooltip/TooltipBase';

const fabVariants = cva(
    'fixed z-50 flex items-center justify-center cursor-pointer rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
    {
        variants: {
            variant: {
                primary:
                    'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
                secondary:
                    'bg-card text-slate-800 shadow-md hover:bg-gray-50 focus:ring-gray-200',
                danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
            },
            size: {
                sm: 'h-12 w-12',
                md: 'h-14 w-14',
                lg: 'h-16 w-16',
            },
            position: {
                'bottom-right': 'bottom-20 right-6',
                'bottom-left': 'bottom-20 left-6',
                'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
                'top-right': 'top-4 right-6',
                'top-left': 'top-4 left-6',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            position: 'bottom-right',
        },
    },
);

interface FabProps
    extends
        ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof fabVariants> {
    icon: ReactNode;
    toolTipText: string;
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(
    (
        { className, variant, size, position, icon, toolTipText, ...props },
        ref,
    ) => {
        return (
            <Tooltip text={toolTipText} side="left" align="center">
                <button
                    ref={ref}
                    className={cn(
                        fabVariants({ variant, size, position, className }),
                    )}
                    aria-label={toolTipText}
                    {...props}
                >
                    {icon}
                </button>
            </Tooltip>
        );
    },
);

Fab.displayName = 'Fab';
