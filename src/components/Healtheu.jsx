import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import { chatWithHealtheu } from '../services/geminiService';

export default function Healtheu() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hi! I am Healtheu. How can I help you with your health today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const response = await chatWithHealtheu(input, messages);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
        setIsLoading(false);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-2xl flex items-center justify-center z-[100] overflow-hidden group border-4 border-white"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? <X className="relative z-10" size={30} /> : <MessageSquare className="relative z-10" size={30} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50, x: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50, x: 50 }}
                        className="fixed bottom-24 right-4 w-[calc(100vw-32px)] max-w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl z-[100] flex flex-col border border-gray-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Healtheu AI</h3>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Intelligent Assistant</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-gray-50 text-gray-700 rounded-tl-none border border-gray-100'
                                    }`}>
                                        {msg.role === 'model' && (
                                            <div className="flex items-center gap-1 mb-2">
                                                <div className="p-1 bg-blue-100 text-blue-600 rounded-md">
                                                    <Sparkles size={10} />
                                                </div>
                                                <span className="text-[9px] uppercase font-extrabold text-blue-400 tracking-wider">AI Analysis</span>
                                            </div>
                                        )}
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything about your health..."
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 transition-all"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
