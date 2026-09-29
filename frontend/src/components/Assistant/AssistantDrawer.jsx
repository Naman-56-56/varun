import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, User, ShieldAlert, Navigation, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { sendChatbotQuery } from '../../services/api';

export default function AssistantDrawer({ isOpen, onClose, initialQuery = '' }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am the **Varun AI Flood Intelligence Assistant**. 
I translate live ML flood nowcasts, drainage telemetry, and flood-safe routing calculations into concise municipal advisories.

**How can I assist you today?**
- Explain why a specific hotspot is flooded
- Advise on the safest evacuation route
- Forecast flood progression over the 0–3h horizon`,
      engine: 'Varun Grounded AI Engine',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'Why is Minto Bridge at high risk?',
    'Which route from Connaught Place to AIIMS is safest?',
    'What areas are expected to flood in the next 60 minutes?',
    'What are the most dangerous roads right now?',
    'What changed between NOW and +120 MIN?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSend = (textToSend = inputQuery) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    sendChatbotQuery(trimmed)
      .then((res) => {
        const aiResponse = {
          role: 'assistant',
          content: res.data.response,
          sources: res.data.grounded_sources,
          engine: res.data.engine || 'Varun Grounded AI Engine',
        };
        setMessages((prev) => [...prev, aiResponse]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Chat error:', err);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'An error occurred while connecting to the AI prediction engine. Please check your backend connection.',
            engine: 'System Error',
          },
        ]);
        setLoading(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[2000] w-full sm:w-[500px] bg-slate-900/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-100 transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-white text-sm">
              <span>Varun AI Flood Assistant</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Conditioned strictly on ML model outputs & physical telemetry
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-medium'
                    : 'bg-slate-950/80 border border-slate-800/80 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert prose-xs">
                  {msg.content}
                </div>

                {!isUser && msg.sources && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-500">Grounded in:</span>
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              Synthesizing ML model features & generating grounded explanation...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-950/70 border-t border-slate-800/80">
        <div className="text-[10px] text-slate-400 mb-1.5 font-semibold">Suggested Situational Queries:</div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about Delhi flood risk, safe routes, or nowcasts..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-purple-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
