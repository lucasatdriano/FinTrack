import { cn } from '@/src/utils/cn';
import { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export function Badge({
    leftIcon,
    rightIcon,
    children,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-semibold transition-colors',
                'bg-gray-100 text-gray-700',
                className,
            )}
            {...props}
        >
            {leftIcon && <span className="flex items-center">{leftIcon}</span>}
            {children}
            {rightIcon && (
                <span className="flex items-center">{rightIcon}</span>
            )}
        </span>
    );
}
