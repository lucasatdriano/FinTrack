'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/utils/cn';

const buttonVariants = cva(
    'cursor-pointer inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-primary text-white hover:bg-primary-hover',
                secondary:
                    'bg-card text-slate-800 border border-gray-200 hover:bg-gray-50',
                danger: 'bg-red-500 text-white hover:bg-red-600',
                disabled: 'bg-slate-200 text-slate-400',
                ghost: 'text-slate-700 hover:bg-slate-100 hover:underline',
                'ghost-primary':
                    'text-primary-hover hover:bg-primary-background hover:underline',
                outline:
                    'border border-primary text-primary-hover hover:bg-primary-background',
            },
            size: {
                sm: 'h-9 px-4 text-sm rounded-lg',
                md: 'h-11 px-6 text-base rounded-xl',
                lg: 'h-14 px-8 text-lg rounded-xl',
            },
            underline: {
                true: 'underline decoration-1 underline-offset-4',
                false: 'no-underline',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            underline: false,
        },
    },
);

interface ButtonProps
    extends
        ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            underline,
            leftIcon,
            rightIcon,
            isLoading,
            children,
            disabled,
            ...props
        },
        ref,
    ) => {
        const finalVariant = disabled ? 'disabled' : variant;

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    buttonVariants({
                        variant: finalVariant,
                        size,
                        underline,
                        className,
                    }),
                )}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="h-5 w-5 animate-spin text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    leftIcon
                )}

                {children}

                {!isLoading && rightIcon}
            </button>
        );
    },
);

Button.displayName = 'Button';
