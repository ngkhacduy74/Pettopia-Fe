'use client';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Suggestion {
  icon: string;
  text: string;
  tag?: string;
}

interface ChatProps {
  showChat: boolean;
  setShowChat: (v: boolean) => void;
  chatMessage: string;
  setChatMessage: (v: string) => void;
  chatSuggestions: Suggestion[];
}

const Chat = memo(function Chat({
  showChat,
  setShowChat,
  chatMessage,
  setChatMessage,
  chatSuggestions
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Chào bạn! Tôi có thể giúp gì?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userId] = useState<string>(() => {
  try {
    if (typeof window === 'undefined') return 'anonymous';
    const key = 'pettopia_chat_userId';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID?.() ?? `uid-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
});

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (overrideMessage?: string) => {
    const content = (overrideMessage ?? chatMessage).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/ai/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await (res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text());
      let aiText = '';

      if (typeof data === 'string') {
        aiText = data;
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed === 'string') aiText = parsed;
          else if (parsed?.content) aiText = parsed.content;
        } catch {}
      } else if (data && typeof data === 'object') {
        aiText =
          data.content ||
          data.reply ||
          data.message ||
          (data.messages?.[0]?.content) ||
          (data.candidates?.[0]?.content?.parts?.[0]?.text) ||
          (data.candidates?.[0]?.content?.text) ||
          (data.choices?.[0]?.message?.content) ||
          JSON.stringify(data);
      }

      const t = String(aiText).trim();
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        try { aiText = JSON.parse(t); } catch {}
      }

      setMessages(prev => [...prev, { role: 'assistant', content: String(aiText) }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi: không thể kết nối tới API' }]);
    } finally {
      setIsLoading(false);
    }
  }, [chatMessage, messages, isLoading, userId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!showChat) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md h-[90vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-teal-100 sm:bottom-6 sm:right-6 sm:w-96 m-4 sm:m-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-teal-100 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg sm:text-xl flex-shrink-0 shadow-md">
            🐾
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm sm:text-base truncate">Pet Care AI</h3>
            <p className="text-xs text-cyan-100 opacity-90">Trợ lý chăm sóc thú cưng</p>
          </div>
        </div>
        <button
          onClick={() => setShowChat(false)}
          className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
        >
          <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-teal-50/20 via-white to-white scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-transparent">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 animate-fadeIn ${m.role === 'user' ? 'justify-end' : ''}`}
            >
              {m.role === 'assistant' ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-sm">🐾</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 sm:p-4 max-w-[85%] shadow-sm border border-teal-100">
                    <p className="text-xs font-semibold text-teal-700 mb-1">Pet Care AI</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl rounded-tr-sm p-3 sm:p-4 max-w-[85%] shadow-md">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-sm">🐾</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-sm border border-teal-100">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions - Chỉ hiện nếu chưa có tin nhắn người dùng */}
      {messages.length === 1 && !isLoading && (
        <div className="px-3 sm:px-4 pb-2 space-y-2 border-b border-teal-100 bg-teal-50/30">
          {chatSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s.text)}
              className="w-full flex items-center gap-3 p-3 bg-white hover:bg-teal-50 rounded-xl text-left transition-all duration-200 border border-teal-100 shadow-sm hover:shadow-md group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="flex-1 text-sm text-gray-700 font-medium">{s.text}</span>
              {s.tag && (
                <span className="text-xs bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-2.5 py-1 rounded-full font-semibold">
                  {s.tag}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-teal-100 flex-shrink-0">
        <div className="flex items-end gap-2 bg-teal-50/70 rounded-xl p-2.5 border border-teal-200 backdrop-blur-sm">
          <input
            ref={inputRef}
            type="text"
            placeholder="Hỏi về chăm sóc thú cưng..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !chatMessage.trim()}
            className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-center text-gray-500 mt-2">
          {isLoading ? 'Đang suy nghĩ...' : 'Nhấn Enter để gửi'}
        </p>
      </div>
    </div>
  );
});

export default Chat;