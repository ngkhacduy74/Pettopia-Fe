'use client';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { getServiceDetail, ServiceDetail } from '../services/petcare/petService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Suggestion {
  text: string;
  tag?: string;
}

interface ChatProps {
  showChat: boolean;
  setShowChat: (v: boolean) => void;
  chatSuggestions: Suggestion[];
}

// Component Avatar riêng - chỉ render & tải ảnh 1 lần duy nhất
const CatAvatar = memo(() => {
  const fallbackSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">' +
    '<rect width="100%" height="100%" fill="%2306b6d4"/>' +
    '</svg>'
  );

  return (
    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-white border border-teal-200">
      <img
        src="/sampleimg/AiCatprofile.png"
        alt="Linh Miêu"
        width={40}
        height={40}
        className="w-full h-full object-cover"
        loading="eager"
        decoding="async"
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackSvg;
        }}
      />
    </div>
  );
});
CatAvatar.displayName = 'CatAvatar';

const Chat = memo(function Chat({
  showChat,
  setShowChat,
  chatSuggestions
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Meo? ngươi cần giúp gì đây?' }
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatMessageRef = useRef('');
  const messagesRef = useRef<Message[]>([]);
  const sendLockRef = useRef(false);

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

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    chatMessageRef.current = chatMessage;
  }, [chatMessage]);

  const fetchAndShowService = useCallback(async (serviceId: string) => {
    try {
      setIsLoading(true);
      const svc: ServiceDetail = await getServiceDetail(serviceId);
      const content = [
        `Dịch vụ: ${svc.name || 'N/A'}`,
        `Giá: ${typeof svc.price !== 'undefined' ? svc.price : 'N/A'}`,
        `Thời lượng: ${typeof svc.duration !== 'undefined' ? svc.duration + ' phút' : 'N/A'}`,
        svc.description ? `Mô tả: ${svc.description}` : null
      ].filter(Boolean).join('\n');
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Không tìm thấy dịch vụ hoặc có lỗi khi tải thông tin.' }]);
    } finally {
      setIsLoading(false);
      sendLockRef.current = false;
    }
  }, []);

  const sendMessage = useCallback(async (overrideMessage?: string) => {
    const content = (overrideMessage ?? chatMessageRef.current).trim();
    if (!content || sendLockRef.current) return;
    sendLockRef.current = true;

    const userMsg: Message = { role: 'user', content };
    const allMessages = [...messagesRef.current, userMsg];

    setMessages(allMessages);
    setIsLoading(true);
    setChatMessage('');

    const svcMatch = content.match(/^(?:\/service\s+|service:\s*)([^\s]+)/i);
    if (svcMatch) {
      await fetchAndShowService(svcMatch[1]);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/v1/ai/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: allMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await (res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text());
      let aiText = '';

      if (typeof data === 'string') {
        aiText = data;
        try {
          const parsed = JSON.parse(data);
          aiText = typeof parsed === 'string' ? parsed : (parsed?.content || JSON.stringify(parsed));
        } catch { }
      } else if (data && typeof data === 'object') {
        aiText = data.content || data.reply || data.message || JSON.stringify(data);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: String(aiText).trim() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi: không thể kết nối tới API' }]);
    } finally {
      setIsLoading(false);
      sendLockRef.current = false;
    }
  }, [userId, fetchAndShowService]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  if (!showChat) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md h-[90vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-teal-100 sm:bottom-6 sm:right-6 sm:w-96 m-4 sm:m-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-teal-100 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <CatAvatar />
          <div>
            <h3 className="font-bold text-white text-base">Trợ thủ linh miêu</h3>
            <p className="text-xs text-cyan-100 opacity-90">Trợ lí chăm sóc thú cưng</p>
          </div>
        </div>
        <button
          onClick={() => setShowChat(false)}
          className="p-2 hover:bg-white/20 rounded-lg transition-all group"
        >
          <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-teal-50/20 via-white to-white scrollbar-thin scrollbar-thumb-teal-200">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 animate-fadeIn ${m.role === 'user' ? 'justify-end' : ''}`}
            >
              {m.role === 'assistant' ? (
                <>
                  <CatAvatar />
                  <div className="bg-white rounded-2xl rounded-tl-sm p-4 max-w-[85%] shadow-sm border border-teal-100">
                    <p className="text-xs font-semibold text-teal-700 mb-1">Linh Miêu</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%] shadow-md">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-pulse">
              <CatAvatar />
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-teal-100">
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

      {/* Suggestions - đã bỏ hết icon, chỉ còn text + tag */}
      {messages.length === 1 && !isLoading && chatSuggestions.length > 0 && (
        <div className="px-4 pb-3 space-y-2 border-b border-teal-100 bg-teal-50/30">
          {chatSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s.text)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-teal-50 rounded-xl text-left transition-all border border-teal-100 shadow-sm hover:shadow-md group"
            >
              <span className="text-sm text-gray-700 font-medium pr-4">{s.text}</span>
              {s.tag && (
                <span className="text-xs bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                  {s.tag}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-teal-100 flex-shrink-0">
        <div className="flex items-center gap-2 bg-teal-50/70 rounded-xl p-1 border border-teal-200">
          <input
            ref={inputRef}
            type="text"
            placeholder="Chào linh miêu nè, bạn biết làm gì?"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-500 py-2"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !chatMessage.trim()}
            className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
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