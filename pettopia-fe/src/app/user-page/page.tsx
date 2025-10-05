'use client';

import React, { useState } from 'react';

export default function PetCareApp() {
  const [showSearch, setShowSearch] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const recentItems = [
    {
      id: 1,
      title: 'Hồ sơ thú cưng',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=200&fit=crop',
      time: '1w ago',
      icon: '🐾'
    },
    {
      id: 2,
      title: 'Lịch khám sắp tới',
      image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=200&fit=crop',
      time: '2d ago',
      icon: '📅'
    },
    {
      id: 3,
      title: 'Nhật ký hôm nay',
      image: null,
      time: '1d ago',
      icon: '📝',
      color: 'from-pink-900 to-pink-800'
    },
    {
      id: 4,
      title: 'Community',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop',
      time: '3h ago',
      icon: '💬'
    },
    {
      id: 5,
      title: 'Dịch vụ ký gửi',
      image: null,
      time: '1w ago',
      icon: '🏨',
      color: 'from-purple-900 to-purple-800'
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Quản lí hồ sơ Pet',
      description: 'Thông tin, sức khỏe, lịch sử khám',
      icon: '🐕',
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 2,
      title: 'Đặt lịch khám',
      description: 'Đặt hẹn với bác sĩ thú y',
      icon: '🏥',
      color: 'from-green-600 to-green-700'
    },
    {
      id: 3,
      title: 'Pet Hotel & Services',
      description: 'Dịch vụ ký gửi và chăm sóc',
      icon: '🏨',
      color: 'from-purple-600 to-purple-700'
    }
  ];

  const chatSuggestions = [
    { icon: '🐾', text: 'Quản lí hồ sơ Pet', tag: 'New' },
    { icon: '📝', text: 'Viết nhật ký cho pet' },
    { icon: '📊', text: 'Xem báo cáo sức khỏe' },
    { icon: '✅', text: 'Tạo nhắc nhở khám định kỳ', tag: 'New' }
  ];

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        {/* User Section */}
        <div className="p-3 border-b border-zinc-800">
          <div className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 cursor-pointer">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-orange-600 rounded flex items-center justify-center text-xs font-bold">
              🐾
            </div>
            <span className="text-sm font-medium flex-1">My Pet Care</span>
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Tìm kiếm</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded bg-pink-600 text-white text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Trang chủ</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
              <span className="text-base">🐕</span>
              <span>Hồ sơ Pet</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
              <span className="text-base">💬</span>
              <span>Community</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <div className="text-xs text-zinc-500 font-medium px-3 mb-2">Truy cập nhanh</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
                <span className="text-base">📝</span>
                <span>Nhật ký Pet</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Lịch khám</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
                <span className="text-base">💊</span>
                <span>Đơn thuốc</span>
              </button>
            </div>
          </div>

          {/* Services */}
          <div className="mt-6">
            <div className="text-xs text-zinc-500 font-medium px-3 mb-2">Dịch vụ</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Thêm dịch vụ</span>
            </button>
          </div>

          {/* My Pets */}
          <div className="mt-6">
            <div className="text-xs text-zinc-500 font-medium px-3 mb-2">Thú cưng của tôi</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs">
                  🐕
                </div>
                <span>Milu</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-xs">
                  🐈
                </div>
                <span>Kitty</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-zinc-800">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 text-sm">
            <div className="w-6 h-6 bg-zinc-700 rounded flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <span>Nâng cấp Premium</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-12">
          {/* Header */}
          <h1 className="text-4xl font-semibold mb-12">Chào buổi chiều 🐾</h1>

          {/* Pet Care AI Assistant Promo */}
          <div className="bg-gradient-to-r from-pink-900 to-purple-900 rounded-xl p-8 mb-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold mb-2">Trợ lý AI chăm sóc thú cưng</h2>
              <p className="text-zinc-300 mb-4">Hỏi đáp mọi thắc mắc về sức khỏe và chăm sóc thú cưng</p>
              <button 
                onClick={() => setShowChat(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Trò chuyện ngay
              </button>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-6xl opacity-50">
              🐕‍🦺
            </div>
          </div>

          {/* Recently Visited */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-medium">Truy cập gần đây</h2>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`rounded-lg overflow-hidden mb-3 aspect-video transition-transform ${hoveredCard === item.id ? 'scale-105' : ''}`}>
                    {item.image ? (
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <span className="text-4xl">{item.icon}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <div className="w-4 h-4 bg-zinc-700 rounded-full" />
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-lg font-medium">Thao tác nhanh</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {quickActions.map((item) => (
                <div
                  key={item.id}
                  className={`bg-gradient-to-br ${item.color} rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform`}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-zinc-200 opacity-90">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowSearch(false)}>
          <div className="bg-zinc-800 rounded-xl w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-700">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="flex-1 bg-transparent outline-none text-white"
                  autoFocus
                />
                <button onClick={() => setShowSearch(false)} className="text-zinc-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-700 text-left">
                <span className="text-base">🐕</span>
                <span>Hồ sơ Pet</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-700 text-left">
                <span className="text-base">💬</span>
                <span>Community</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-700 text-left">
                <span className="text-base">📝</span>
                <span>Nhật ký Pet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {showChat && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-zinc-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-zinc-700">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl">
                🐾
              </div>
              <div>
                <h3 className="font-semibold">Pet Care AI</h3>
                <p className="text-xs text-zinc-400">Trợ lý chăm sóc thú cưng</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-zinc-700 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-zinc-700 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button 
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-zinc-700 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  🐾
                </div>
                <div className="bg-zinc-700 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                  <p className="text-sm font-semibold mb-2">Chào bạn! Tôi có thể giúp gì?</p>
                  <p className="text-sm text-zinc-300">Hãy chọn một trong các gợi ý bên dưới hoặc đặt câu hỏi của bạn</p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                {chatSuggestions.map((suggestion, index) => (
                  <button 
                    key={index}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-left transition-colors"
                  >
                    <span className="text-xl">{suggestion.icon}</span>
                    <span className="text-sm flex-1">{suggestion.text}</span>
                    {suggestion.tag && (
                      <span className="text-xs bg-blue-500 px-2 py-1 rounded">{suggestion.tag}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <button className="p-2 hover:bg-zinc-700 rounded text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <span className="text-xs text-zinc-400">Auto</span>
              <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>All sources</span>
              </button>
            </div>
            <div className="flex items-end gap-2 bg-zinc-700 rounded-xl p-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Hỏi, tìm kiếm hoặc nhập bất kỳ điều gì..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              <button className="p-2 bg-zinc-600 hover:bg-zinc-500 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-zinc-500 text-center mt-2">Hãy nhập tin nhắn để bắt đầu</p>
          </div>
        </div>
      )}

      {/* Chat Button (when closed) */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform z-40"
        >
          💬
        </button>
      )}
    </div>
  );
}