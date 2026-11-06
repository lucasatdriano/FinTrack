'use client';

import { useState, useRef, useEffect } from 'react';
import { SendIcon, BotIcon } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { cn } from '@/src/utils/cn';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content:
                'Olá, Lucas! Sou o Fin, seu assistente financeiro.\nComo posso te ajudar hoje? Posso analisar seus gastos, sugerir metas de economia ou tirar dúvidas sobre investimentos.',
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleSend = () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const aiResponses = [
                'Ótima pergunta! Com base nos seus últimos relatórios, você gastou R$ 650,00 com lazer este mês, o que representa 15,3% das despesas. Um bom ponto de partida seria reduzir esse valor em 10% no próximo mês.',
                'Analisando seus dados, suas receitas cresceram 7,41% em relação a setembro. Isso é ótimo! Sugiro destinar 30% desse excedente para o seu fundo de emergência.',
                'Notei que sua categoria de Alimentação está em R$ 1.000,00 de um limite de R$ 1.200,00. Você ainda tem R$ 200,00 de margem. Recomendo monitorar os próximos gastos para não estourar o orçamento.',
            ];

            const randomResponse =
                aiResponses[Math.floor(Math.random() * aiResponses.length)];

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: randomResponse,
                },
            ]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto bg-card rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-white">
                <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <BotIcon size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800">Fin</h2>
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Assistente financeiro online
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        role={msg.role}
                        content={msg.content}
                    />
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <BotIcon size={16} />
                        </div>
                        <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                            <span
                                className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0ms' }}
                            />
                            <span
                                className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: '150ms' }}
                            />
                            <span
                                className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: '300ms' }}
                            />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pergunte algo sobre suas finanças..."
                        rows={1}
                        className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 px-2 py-2 max-h-30 overflow-y-auto"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className={cn(
                            'h-9 w-9 rounded-xl flex items-center justify-center transition-colors shrink-0 mb-0.5',
                            input.trim() && !isTyping
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
                        )}
                    >
                        <SendIcon size={18} />
                    </button>
                </div>

                <p className="text-[10px] text-center text-slate-400 mt-2">
                    O Fin pode cometer erros. Considere verificar informações
                    importantes.
                </p>
            </div>
        </div>
    );
}
