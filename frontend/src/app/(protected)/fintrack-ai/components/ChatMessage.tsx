import { SparklesIcon, UserIcon } from 'lucide-react';
import { cn } from '@/src/utils/cn';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <div
            className={cn(
                'flex gap-3 w-full',
                isUser ? 'flex-row-reverse' : 'flex-row',
            )}
        >
            <div
                className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1',
                    isUser
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-emerald-500 text-white shadow-sm',
                )}
            >
                {isUser ? <UserIcon size={16} /> : <SparklesIcon size={16} />}
            </div>

            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    isUser
                        ? 'bg-emerald-500 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm',
                )}
            >
                {content.split('\n').map((line, i) => (
                    <span key={i}>
                        {line}
                        {i !== content.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </div>
        </div>
    );
}
