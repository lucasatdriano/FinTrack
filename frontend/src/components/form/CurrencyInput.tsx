'use client';

import { useState, useEffect, forwardRef } from 'react';
import { Input } from './TextInputForm';

interface CurrencyInputProps {
    label?: string;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    error?: string;
    isRequired?: boolean;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ label, value, onChange, error, isRequired }, ref) => {
        const [displayValue, setDisplayValue] = useState('');

        useEffect(() => {
            if (value !== undefined) {
                setDisplayValue(
                    new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(value),
                );
            } else {
                setDisplayValue('');
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value.replace(/\D/g, '');

            if (!rawValue) {
                setDisplayValue('');
                onChange(undefined);
                return;
            }

            const numberValue = Number(rawValue) / 100;

            setDisplayValue(
                new Intl.NumberFormat('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(numberValue),
            );

            onChange(numberValue);
        };

        return (
            <div className="relative">
                <span className="absolute left-4 bottom-3 text-lg font-medium text-slate-400 z-10 pointer-events-none">
                    R$
                </span>

                <Input
                    ref={ref}
                    label={label}
                    value={displayValue}
                    onChange={handleChange}
                    error={error}
                    isRequired={isRequired}
                    className="pl-12 text-2xl font-semibold text-slate-500 h-14"
                    placeholder="0,00"
                    inputMode="numeric"
                />
            </div>
        );
    },
);

CurrencyInput.displayName = 'CurrencyInput';
