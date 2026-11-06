'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/src/utils/cn';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(
                    1,
                    '...',
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages,
                );
            } else {
                pages.push(
                    1,
                    '...',
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    '...',
                    totalPages,
                );
            }
        }
        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <span className="text-xs text-slate-400 order-2 sm:order-1">
                Mostrando{' '}
                <strong className="text-slate-700">{startItem}</strong>–
                <strong className="text-slate-700">{endItem}</strong> de{' '}
                <strong className="text-slate-700">{totalItems}</strong>{' '}
                transações
            </span>

            <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    className="flex cursor-pointer h-10 w-12 items-center justify-center rounded-xl border border-slate-200 bg-card text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeftIcon size={18} />
                </button>

                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-1 text-slate-400 text-sm"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
                            type="button"
                            onClick={() => onPageChange(pageNumber)}
                            aria-label={`Ir para página ${pageNumber}`}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'flex cursor-pointer h-10 w-12 items-center justify-center rounded-xl text-sm font-semibold transition-colors',
                                isActive
                                    ? 'bg-emerald-500 text-white shadow-sm border border-emerald-500'
                                    : 'bg-card text-slate-700 border border-slate-300 hover:bg-slate-100',
                            )}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                    className="flex cursor-pointer h-10 w-12 items-center justify-center rounded-xl border border-slate-200 bg-card text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRightIcon size={18} />
                </button>
            </div>
        </div>
    );
}
