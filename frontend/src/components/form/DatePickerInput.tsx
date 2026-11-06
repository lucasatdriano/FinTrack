'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, XIcon } from 'lucide-react';
import { Input } from './TextInputForm';

interface DatePickerProps {
    label?: string;
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    error?: string;
    isRequired?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

export function DatePicker({
    label,
    value,
    onChange,
    error,
    isRequired,
    disabled,
    placeholder = 'DD/MM/AAAA',
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formattedValue =
        value && isValid(value) ? format(value, 'dd/MM/yyyy') : '';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value;
        if (!dateString) {
            onChange(undefined);
            return;
        }

        const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
        if (isValid(parsedDate)) {
            onChange(parsedDate);
        }
    };

    return (
        <div
            className="relative w-full flex flex-col gap-1.5"
            ref={containerRef}
        >
            <div
                onClick={() => !disabled && setIsOpen(true)}
                className="cursor-pointer"
            >
                <Input
                    label={label}
                    value={formattedValue}
                    onChange={handleInputChange}
                    error={error}
                    isRequired={isRequired}
                    disabled={disabled}
                    placeholder={placeholder}
                    rightIcon={
                        value ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(undefined);
                                }}
                                className="hover:text-gray-600 text-gray-400"
                            >
                                <XIcon size={16} />
                            </button>
                        ) : (
                            <CalendarIcon
                                size={18}
                                className="pointer-events-none"
                            />
                        )
                    }
                />
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 z-50 mt-1 rounded-xl border border-gray-200 bg-card shadow-xl w-[320px]">
                    <div className="p-3 react-day-picker-custom">
                        <DayPicker
                            mode="single"
                            selected={value}
                            onSelect={(date) => {
                                onChange(date);
                                setIsOpen(false);
                            }}
                            locale={ptBR}
                            animate
                            showOutsideDays
                            footer={
                                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3 px-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(undefined);
                                            setIsOpen(false);
                                        }}
                                        className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        Limpar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(new Date());
                                            setIsOpen(false);
                                        }}
                                        className="text-sm font-medium text-primary-hover hover:text-primary-hover transition-colors"
                                    >
                                        Hoje - {format(new Date(), 'dd/MM')}
                                    </button>
                                </div>
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
