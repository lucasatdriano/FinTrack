'use client';

import { InputHTMLAttributes, ReactNode, forwardRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/utils/cn';

const inputVariants = cva(
    'w-full rounded-lg border px-4 py-2.5 text-gray-900 outline-none transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            state: {
                default:
                    'border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary',
                error: 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30',
                disabled: 'bg-gray-100 border-gray-200 text-gray-500',
            },
        },
        defaultVariants: {
            state: 'default',
        },
    },
);

interface InputProps
    extends
        InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof inputVariants> {
    label?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    error?: string;
    isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            leftIcon,
            rightIcon,
            error,
            isRequired,
            type = 'text',
            className,
            id,
            disabled,
            ...props
        },
        ref,
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const inputType = type === 'password' && showPassword ? 'text' : type;

        const currentState = error
            ? 'error'
            : disabled
              ? 'disabled'
              : 'default';

        const paddingLeft = leftIcon ? 'pl-10' : 'pl-4';
        const paddingRight =
            rightIcon || type === 'password' || type === 'date'
                ? 'pr-10'
                : 'pr-4';

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium text-slate-500 flex items-center gap-1"
                    >
                        {label}
                        {isRequired && (
                            <span className="text-slate-400">*</span>
                        )}
                    </label>
                )}

                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="absolute left-3 text-gray-400 pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={id}
                        type={inputType}
                        disabled={disabled}
                        className={cn(
                            inputVariants({ state: currentState }),
                            paddingLeft,
                            paddingRight,
                            className,
                        )}
                        {...props}
                    />

                    <div className="absolute right-3 flex items-center justify-center text-gray-400">
                        {type === 'password' ? (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="hover:text-gray-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOffIcon size={18} />
                                ) : (
                                    <EyeIcon size={18} />
                                )}
                            </button>
                        ) : rightIcon ? (
                            rightIcon
                        ) : null}
                    </div>
                </div>

                {error ? (
                    <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                        {error}
                    </span>
                ) : null}
            </div>
        );
    },
);

Input.displayName = 'Input';
