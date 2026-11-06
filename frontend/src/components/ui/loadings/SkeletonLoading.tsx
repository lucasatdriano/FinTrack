import { cn } from '@/src/utils/cn';
import { HTMLAttributes } from 'react';

export function Skeleton({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-slate-200/60',
                className,
            )}
            {...props}
        />
    );
}

export function SkeletonRow() {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />

            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[60%]" />
                <Skeleton className="h-3 w-[30%]" />
            </div>
        </div>
    );
}
