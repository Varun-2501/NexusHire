import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader, Bot, Sparkles, Filter, Search } from 'lucide-react';
import { sendMessage } from '../../api/index.js';
import { useJobs } from '../../context/JobContext.jsx';

const SUGGESTIONS = [
  'Show me remote React jobs',
  'Filter by last 24 hours',
  'High match scores only',
  'Clear all filters',
  'How does job matching work?',
  'Where can I see my applications?',
];

function Message({ msg }) {
  const isAI = msg.role === 'assistant';
  const hasFilter = msg.filterUpdates && Object.keys(msg.filterUpdates).length > 0;
  const hasSearch = msg.searchQuery && (msg.searchQuery.title || msg.searchQuery.skills?.length > 0);

  return (
    <div className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}>
      {isAI && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.25)' }}>
          <Bot size={13} className="text-teal-400" />
        </div>
      )}
      <div className={`max-w-[82%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        <div className="rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
          style={isAI
            ? { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
            : { background: 'linear-gradient(135deg, rgba(45,212,191,0.8), rgba(45,212,191,0.6))', color: '#050508' }}>
          {msg.content}
        </div>
        {isAI && hasFilter && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs"
            style={{ color: '#2DD4BF' }}>
            <Filter size={10} />
            <span>Filters updated</span>
          </div>
        )}
        {isAI && hasSearch && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs"
            style={{ color: '#A78BFA' }}>
            <Search size={10} />
            <span>Searching jobs…</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIChatBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI assistant. I can search for jobs, update filters, or answer questions. Try asking me anything! 🚀' }
  ]);
  const [loading, setLoading] = useState(false);
  const { applyAIFilters, updateFilters } = useJobs();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const result = await sendMessage(msg, history);

      const aiMsg = {
        role: 'assistant',
        content: result.response,
        filterUpdates: result.filterUpdates,
        searchQuery: result.searchQuery,
      };
      setMessages(prev => [...prev, aiMsg]);

      // Apply AI-driven changes to the job feed
      if (result.filterUpdates) {
        applyAIFilters(result.filterUpdates);
      }
      if (result.searchQuery && result.intent === 'search') {
        const sq = result.searchQuery;
        const updates = {};
        if (sq.title) updates.title = sq.title;
        if (sq.skills?.length) updates.skills = sq.skills;
        if (sq.workMode && sq.workMode !== 'null') updates.workMode = sq.workMode;
        if (sq.jobType && sq.jobType !== 'null') updates.jobType = sq.jobType;
        if (sq.location && sq.location !== 'null') updates.location = sq.location;
        if (sq.datePosted && sq.datePosted !== 'null') updates.datePosted = sq.datePosted;
        if (Object.keys(updates).length > 0) applyAIFilters(updates);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Oops, something went wrong. Please try again!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{
          background: open ? '#12121C' : 'linear-gradient(135deg, #2DD4BF, #A78BFA)',
          border: open ? '1px solid rgba(45,212,191,0.3)' : 'none',
          boxShadow: open ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(45,212,191,0.3)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}>
        <AnimatePresence mode="wait">
          <motion.div key={open ? 'x' : 'chat'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}>
            {open ? <X size={20} color="#2DD4BF" /> : <MessageCircle size={20} color="#050508" />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col"
            style={{
              height: '520px',
              background: '#0D0D15',
              border: '1px solid rgba(45,212,191,0.2)',
              borderRadius: '20px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(45,212,191,0.05)',
              overflow: 'hidden',
            }}>

            {/* Header */}
            <div className="px-4 py-3.5 flex items-center gap-3"
              style={{ borderBottom: '1px solid var(--border)', background: 'rgba(45,212,191,0.04)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(45,212,191,0.3)' }}>
                <Sparkles size={14} style={{ color: '#2DD4BF' }} />
              </div>
              <div>
                <div className="text-sm font-semibold font-display" style={{ color: 'var(--text-primary)' }}>AI Assistant</div>
                <div className="text-xs flex items-center gap-1.5" style={{ color: '#2DD4BF' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 pulse-dot" />
                  LangGraph · Online
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} />
              ))}
              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.25)' }}>
                    <Bot size={13} className="text-teal-400" />
                  </div>
                  <div className="rounded-2xl px-3.5 py-2.5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                    <div className="flex gap-1.5 items-center h-4">
                      {[0, 0.15, 0.3].map(d => (
                        <div key={d} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: '#2DD4BF', animation: `pulse-dot 1s ease-in-out infinite`, animationDelay: d + 's' }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-3">
                <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Try asking:</div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.slice(0, 4).map(s => (
                    <button key={s} onClick={() => handleSend(s)}
                      className="chip text-xs px-2.5 py-1 rounded-full"
                      style={{ fontSize: '11px' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about jobs, filters..."
                  className="input-dark flex-1 rounded-xl px-3.5 py-2.5 text-xs"
                  disabled={loading}
                />
                <button onClick={() => handleSend()} disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !loading ? 'rgba(45,212,191,0.85)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                  }}>
                  {loading
                    ? <Loader size={13} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                    : <Send size={13} style={{ color: input.trim() ? '#050508' : 'var(--text-muted)' }} />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
