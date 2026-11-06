'use client';

import { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/src/utils/cn';

const dropdownTriggerVariants = cva(
    'w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-left cursor-pointer outline-none transition-colors bg-card disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            state: {
                default: 'border-gray-200 hover:border-gray-300',
                open: 'border-primary ring-1 ring-primary',
                error: 'border-red-500 bg-red-50/30',
            },
        },
        defaultVariants: {
            state: 'default',
        },
    },
);

interface DropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    isRequired?: boolean;
    disabled?: boolean;
}

export function Dropdown({
    label,
    options,
    value,
    onChange,
    error,
    isRequired,
    disabled,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentState = error ? 'error' : isOpen ? 'open' : 'default';

    return (
        <div className="flex flex-col gap-1.5 w-full relative">
            {label && (
                <label className="text-sm font-medium text-slate-500 flex gap-1">
                    {label}{' '}
                    {isRequired && <span className="text-slate-400">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(dropdownTriggerVariants({ state: currentState }))}
            >
                <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                    {value || 'Selecione...'}
                </span>
                <ChevronDownIcon
                    size={18}
                    className={cn(
                        'text-gray-400 transition-transform',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-card border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className={cn(
                                'w-full flex items-center justify-between cursor-pointer px-4 py-2.5 text-sm transition-colors',
                                value === option
                                    ? 'bg-primary-background text-primary-hover font-medium'
                                    : 'text-gray-700 hover:bg-gray-50',
                            )}
                        >
                            {option}
                            {value === option && (
                                <CheckIcon
                                    size={16}
                                    className="text-primary-hover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <span className="text-xs text-red-500 mt-0.5">{error}</span>
            )}
        </div>
    );
}
