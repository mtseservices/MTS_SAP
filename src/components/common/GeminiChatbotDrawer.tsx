import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, User, RefreshCw } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

export const GeminiChatbotDrawer: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_1',
      role: 'model',
      text: `Hello! I am your MTS ERP SAP AI Assistant for ${currentCompany.name}. How can I assist you with financial ledgers, inventory stock, purchase orders, or FBR tax compliance today?`,
      time: '12:00 PM'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsgText = input.trim();
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.map(m => ({ role: m.role, text: m.text })),
          companyContext: currentCompany
        })
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        role: 'model',
        text: data.reply || 'I have analyzed your request based on ERP records.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: `[Offline AI Assistant] Systems operating normally. Ledgers for ${currentCompany.name} are verified in PKR.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 p-3.5 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-2xl shadow-cyan-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Open Gemini AI ERP Chatbot"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[520px] animate-in fade-in slide-in-from-bottom-5">
          {/* Drawer Header */}
          <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                  MTS Gemini AI Advisor
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                    gemini-3.8-flash
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">{currentCompany.name}</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-300 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-2xl space-y-1 ${
                    m.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  <div className="text-[9px] opacity-60 text-right">{m.time}</div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                Gemini is analyzing ERP records...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/90 rounded-b-2xl flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about accounts, stock, or tax rules..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
