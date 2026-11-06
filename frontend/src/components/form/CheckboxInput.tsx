'use client';

import { CheckIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/src/utils/cn';

const checkboxVariants = cva(
    'w-5 h-5 rounded border flex items-center justify-center transition-colors',
    {
        variants: {
            state: {
                unchecked:
                    'border-gray-300 bg-card group-hover:border-gray-400',
                checked: 'bg-primary border-primary',
                error: 'border-red-500 bg-card group-hover:border-red-600',
            },
        },
        defaultVariants: {
            state: 'unchecked',
        },
    },
);

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    error?: string;
    disabled?: boolean;
}

export function Checkbox({
    label,
    checked,
    onChange,
    error,
    disabled,
}: CheckboxProps) {
    const currentState = error ? 'error' : checked ? 'checked' : 'unchecked';

    return (
        <div className="flex flex-col gap-1">
            <label
                className={cn(
                    'flex items-center gap-3 group',
                    disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer',
                )}
            >
                <div className="relative flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={disabled}
                        className="peer sr-only"
                    />
                    <div
                        className={cn(
                            checkboxVariants({ state: currentState }),
                        )}
                    >
                        {checked && (
                            <CheckIcon
                                size={14}
                                className="text-white stroke-3"
                            />
                        )}
                    </div>
                </div>
                <span
                    className={cn(
                        'text-sm',
                        error ? 'text-red-500' : 'text-slate-600',
                    )}
                >
                    {label}
                </span>
            </label>
            {error && (
                <span className="text-xs text-red-500 mt-0.5">{error}</span>
            )}
        </div>
    );
}
