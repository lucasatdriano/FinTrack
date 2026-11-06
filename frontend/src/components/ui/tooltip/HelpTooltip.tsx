'use client';

import { useState, useRef, useEffect } from 'react';
import { InfoIcon } from 'lucide-react';

interface CustomHelpTooltipProps {
    title: string;
    term: string;
    description: string;
}

export function CustomHelpTooltip({
    term,
    description,
}: CustomHelpTooltipProps) {
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

    return (
        <div className="relative inline-flex items-center" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
                <InfoIcon size={14} className="ml-1" />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-card border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Detalhe do investimento
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-3">
                        <p className="font-semibold text-slate-800 text-sm mb-1">
                            {term}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            {description}
                        </p>
                    </div>
                    <p className="text-[10px] text-slate-400">
                        Conteúdo educativo. Não é recomendação de investimento.
                    </p>
                </div>
            )}
        </div>
    );
}
