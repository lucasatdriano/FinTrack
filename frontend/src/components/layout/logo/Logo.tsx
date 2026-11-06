import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/utils/cn';

function LogoIcon({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-[30%] bg-emerald-500 text-white',
                className,
            )}
        >
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-1/2 h-1/2"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect x="4" y="14" width="3" height="6" rx="1" />
                <rect x="10.5" y="8" width="3" height="12" rx="1" />
                <rect x="17" y="4" width="3" height="16" rx="1" />
            </svg>
        </div>
    );
}

const logoVariants = cva('flex text-slate-800 font-semibold tracking-tight', {
    variants: {
        variant: {
            horizontal: 'flex-row items-center gap-3',
            vertical: 'flex-col items-center gap-3 text-center',
            icon: '',
        },
        size: {
            sm: 'text-lg',
            md: 'text-2xl',
            lg: 'text-4xl',
        },
    },
    defaultVariants: {
        variant: 'horizontal',
        size: 'md',
    },
});

const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
};

interface LogoProps
    extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof logoVariants> {}

export function Logo({
    variant = 'horizontal',
    size = 'md',
    className,
    ...props
}: LogoProps) {
    if (variant === 'icon') {
        return (
            <div className={cn('inline-flex', className)} {...props}>
                <LogoIcon
                    className={iconSizes[size as keyof typeof iconSizes]}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(logoVariants({ variant, size, className }))}
            {...props}
        >
            <LogoIcon className={iconSizes[size as keyof typeof iconSizes]} />
            <span className="text-slate-800">FinTrack</span>
        </div>
    );
}
