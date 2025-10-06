'use client';
import React from 'react';

export default function Chat({
  showChat,
  setShowChat,
  chatMessage,
  setChatMessage,
  chatSuggestions
}: {
  showChat: boolean;
  setShowChat: (v: boolean) => void;
  chatMessage: string;
  setChatMessage: (v: string) => void;
  chatSuggestions: { icon: string; text: string; tag?: string }[];
}) {
  if (!showChat) return null;
  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md h-[90vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-teal-100 sm:bottom-6 sm:right-6 sm:w-96 m-4 sm:m-0">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-teal-100 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
            🐾
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm sm:text-base truncate">Pet Care AI</h3>
            <p className="text-xs text-cyan-50 truncate">Trợ lý chăm sóc thú cưng</p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <button className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors hidden sm:block">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button 
            onClick={() => setShowChat(false)}
            className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-teal-50/30 to-white min-h-0">
        <div className="mb-4">
          <div className="flex items-start gap-2 sm:gap-3 mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
              🐾
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm p-3 sm:p-4 max-w-[85%] shadow-sm border border-teal-100">
              <p className="text-xs sm:text-sm font-semibold mb-2 text-gray-900">Chào bạn! Tôi có thể giúp gì?</p>
              <p className="text-xs sm:text-sm text-gray-600">Hãy chọn một trong các gợi ý bên dưới hoặc đặt câu hỏi của bạn</p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            {chatSuggestions.map((suggestion, index) => (
              <button 
                key={index}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white hover:bg-teal-50 rounded-xl text-left transition-colors border border-teal-100 shadow-sm"
              >
                <span className="text-lg sm:text-xl flex-shrink-0">{suggestion.icon}</span>
                <span className="text-xs sm:text-sm flex-1 text-gray-700 leading-tight">{suggestion.text}</span>
                {suggestion.tag && (
                  <span className="text-xs bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-2 py-1 rounded-full font-medium flex-shrink-0">{suggestion.tag}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-3 sm:p-4 border-t border-teal-100 bg-white rounded-b-2xl flex-shrink-0">
        <div className="flex items-center gap-2 mb-2 overflow-x-auto scrollbar-hide">
          <button className="p-1.5 sm:p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors flex-shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <span className="text-xs text-teal-600 font-medium flex-shrink-0">Auto</span>
          <button className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium flex-shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="hidden sm:inline">All sources</span>
          </button>
        </div>
        <div className="flex items-end gap-2 bg-teal-50 rounded-xl p-2.5 sm:p-3 border border-teal-100">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Hỏi, tìm kiếm..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <button className="p-1.5 sm:p-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg transition-all shadow-sm hover:shadow-md flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Hãy nhập tin nhắn để bắt đầu</p>
      </div>
    </div>
  );
}