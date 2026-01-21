import React, { useState, useRef, useEffect } from 'react';
import api from '../api/api';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: 'Hola, soy tu asistente de costes. Pregúntame sobre tus productos, materias primas o contabilidad.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const { data } = await api.post('/api/ai/chat', { message: userMsg });
            setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Lo siento, tuve un problema conectando con el servidor.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-[#0b0415]/90 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 w-96 h-[550px] flex flex-col mb-6 overflow-hidden transition-all animate-scale-in origin-bottom-right">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#8a5cf5] to-[#5d3fd3] p-6 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-3">
                            <Bot size={22} className="text-white" />
                            <h3 className="font-bold text-lg serif tracking-tight">Asistente Fiscal</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[85%] rounded-[24px] p-4 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#8a5cf5] text-white rounded-tr-none shadow-lg shadow-purple-500/20'
                                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex space-x-1.5 grayscale opacity-50">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75" />
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-6 bg-black/40 border-t border-white/5 flex space-x-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pregunta sobre tus costes..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-[#8a5cf5] transition-all text-sm outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-[#8a5cf5] hover:bg-[#5d3fd3] text-white p-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 group"
                        >
                            <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[22px] shadow-2xl transition-all duration-500 hover:scale-105 flex items-center justify-center ${isOpen ? 'bg-white/10 text-white rotate-90 border border-white/20' : 'bg-gradient-to-br from-[#8a5cf5] to-[#5d3fd3] text-white shadow-purple-500/30'}`}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>
        </div>
    );
};

export default Chatbot;
