'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/utils/cn';

const textAreaVariants = cva(
    'w-full rounded-lg border px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-400 resize-y min-h-[100px] disabled:cursor-not-allowed disabled:opacity-50',
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

interface TextAreaProps
    extends
        TextareaHTMLAttributes<HTMLTextAreaElement>,
        VariantProps<typeof textAreaVariants> {
    label?: string;
    error?: string;
    note?: string;
    isRequired?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        { label, error, note, isRequired, className, id, disabled, ...props },
        ref,
    ) => {
        const currentState = error
            ? 'error'
            : disabled
              ? 'disabled'
              : 'default';

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

                <textarea
                    ref={ref}
                    id={id}
                    disabled={disabled}
                    className={cn(
                        textAreaVariants({ state: currentState }),
                        className,
                    )}
                    {...props}
                />

                {error ? (
                    <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                        {error}
                    </span>
                ) : note ? (
                    <span className="text-xs text-gray-500 mt-0.5">{note}</span>
                ) : null}
            </div>
        );
    },
);

TextArea.displayName = 'TextArea';
