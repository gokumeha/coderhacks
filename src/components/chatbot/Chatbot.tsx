import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, Volume2 } from 'lucide-react';
import { useUIStore, useLangStore } from '@/store';
import { aiService } from '@/services/ai/aiService';
import { speechService } from '@/services/speech/speechService';
import { CHATBOT_FAQ } from '@/data';

interface Message { role: 'user' | 'ai'; text: string; time: string; }

const formatTime = () => new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

export const Chatbot: React.FC = () => {
  const { chatbotOpen, toggleChatbot } = useUIStore();
  const { language } = useLangStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '🐟 Hello! I\'m FishFlow AI assistant. Ask me about prices, harbors, auctions, or where to sell your fish!', time: formatTime() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const query = text ?? input.trim();
    if (!query) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: query, time: formatTime() }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const response = aiService.getChatResponse(query, language);
    setMessages(m => [...m, { role: 'ai', text: response, time: formatTime() }]);
    setLoading(false);
    speechService.speak(response, language);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setInput(t); send(t); };
    rec.start();
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg glow-cyan animate-pulse-glow hover:scale-110 transition-transform"
        aria-label="Open AI chatbot"
      >
        <AnimatePresence mode="wait">
          {chatbotOpen
            ? <motion.div key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90 }} animate={{ rotate: 0 }}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {chatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] h-[520px] glass-strong rounded-2xl border border-cyan-500/25 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">FishFlow AI</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Online
                </p>
              </div>
              <button onClick={toggleChatbot} className="ml-auto text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                      : 'glass border border-cyan-500/15 text-slate-200 rounded-bl-sm'
                  }`}>
                    {m.text}
                    {m.role === 'ai' && (
                      <button onClick={() => speechService.speak(m.text, language)} className="ml-2 text-cyan-400 hover:text-cyan-300 inline-block align-middle">
                        <Volume2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass border border-cyan-500/15 px-4 py-3 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* FAQ chips */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {CHATBOT_FAQ.slice(0, 3).map(q => (
                <button key={q} onClick={() => send(q)} className="shrink-0 text-xs px-3 py-1.5 rounded-full glass border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/15 transition-all whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-cyan-500/15 flex items-center gap-2">
              <button onClick={handleVoiceInput} className="p-2 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-all">
                <Mic size={18} />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about prices, harbors..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <button onClick={() => send()} disabled={!input.trim()} className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-40 transition-all">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
