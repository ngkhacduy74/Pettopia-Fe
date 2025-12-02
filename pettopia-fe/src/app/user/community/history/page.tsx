'use client'
import React, { useState } from 'react';

interface Post {
  id: number;
  category: string;
  title: string;
  author: string;
  avatar: string;
  time: string;
  threads: string | number;
  messages: string | number;
  badge?: {
    text: string;
    color: string;
  } | null;
  viewedAt?: string;
  favoritedAt?: string;
}

export default function PostHistoryPage() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  const [favoritePosts] = useState<Post[]>([
    {
      id: 1,
      category: 'review',
      title: '"Bắt đầy" VF7 Plus',
      author: 'YuroR',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuror',
      time: '5 minutes ago',
      threads: '1K+',
      messages: '150.8K',
      badge: { text: 'đánh giá', color: 'bg-red-600' },
      favoritedAt: 'Today at 2:30 PM'
    },
    {
      id: 2,
      category: 'chiase',
      title: 'Lỗi máy tính',
      author: 'honeyz',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=honeyz',
      time: '8 minutes ago',
      threads: '1K+',
      messages: '130.5K',
      badge: { text: 'kiến thức', color: 'bg-blue-600' },
      favoritedAt: 'Yesterday at 10:15 AM'
    },
    {
      id: 3,
      category: 'tintuc',
      title: 'VinFast lập kỷ lục, giao 60,274 xe trong năm 2024',
      author: 'DHD',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dhd',
      time: '7 minutes ago',
      threads: '1K+',
      messages: '83K',
      badge: { text: 'tin tức', color: 'bg-yellow-500' },
      favoritedAt: 'Oct 14, 2025'
    }
  ]);

  const [recentlyViewedPosts] = useState<Post[]>([
    {
      id: 4,
      category: 'gopy',
      title: 'Đã gửi sms vẫn chưa trả lời',
      author: 'Onikage',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=onikage',
      time: 'Today at 5:09 PM',
      threads: '3.3K',
      messages: '69.3K',
      badge: { text: 'báo lỗi', color: 'bg-red-500' },
      viewedAt: 'Just now'
    },
    {
      id: 5,
      category: 'tuvan',
      title: 'Tài chính 20m, ít game, chủ yếu làm việc',
      author: 'bachback',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bachback',
      time: 'Today at 8:15 PM',
      threads: '5.7K',
      messages: '59.7K',
      badge: null,
      viewedAt: '5 minutes ago'
    },
    {
      id: 6,
      category: 'review',
      title: '"Bắt đầy" VF7 Plus',
      author: 'YuroR',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuror',
      time: '5 minutes ago',
      threads: '1K+',
      messages: '150.8K',
      badge: { text: 'đánh giá', color: 'bg-red-600' },
      viewedAt: '15 minutes ago'
    },
    {
      id: 7,
      category: 'thongbao',
      title: 'Admin thú hai của VMM sắp về - Kuang2',
      author: 'duc4eyes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc4eyes',
      time: 'Aug 26, 2025',
      threads: 20,
      messages: 54,
      badge: null,
      viewedAt: '2 hours ago'
    },
    {
      id: 8,
      category: 'tintuc',
      title: 'VinFast lập kỷ lục, giao 60,274 xe trong năm 2024',
      author: 'DHD',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dhd',
      time: '7 minutes ago',
      threads: '1K+',
      messages: '83K',
      badge: { text: 'tin tức', color: 'bg-yellow-500' },
      viewedAt: 'Yesterday at 6:30 PM'
    }
  ]);

  const displayedPosts = activeTab === 'favorites' ? favoritePosts : recentlyViewedPosts;

  return (
    <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-5xl font-extrabold text-teal-800 mb-2 tracking-tight">
              Lịch sử bài viết
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              Quản lý các bài viết yêu thích và đã xem gần đây của bạn
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-2 mb-6 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'favorites'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Yêu thích ({favoritePosts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đã xem ({recentlyViewedPosts.length})
            </button>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedPosts.length === 0 ? (
              <div className="col-span-2 text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 mb-4">
                  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa có bài viết nào
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'favorites' 
                    ? 'Bạn chưa có bài viết yêu thích nào'
                    : 'Bạn chưa xem bài viết nào gần đây'}
                </p>
              </div>
            ) : (
              displayedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-teal-100 p-6 hover:shadow-md transition-all cursor-pointer hover:border-teal-300 group"
                >
                  <div className="flex gap-4">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          {post.badge && (
                            <span className={`${post.badge.color} text-white text-xs px-2 py-1 rounded-full font-semibold mr-2 inline-block mb-1`}>
                              {post.badge.text}
                            </span>
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 line-clamp-2">
                            {post.title}
                          </h3>
                        </div>
                        
                        {activeTab === 'favorites' && (
                          <button className="text-red-500 hover:text-red-600 flex-shrink-0">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {post.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-6 text-sm">
                          <div className="text-gray-600">
                            <span className="font-semibold text-gray-900">{post.threads}</span>
                            <span className="ml-1">Threads</span>
                          </div>
                          <div className="text-gray-600">
                            <span className="font-semibold text-gray-900">{post.messages}</span>
                            <span className="ml-1">Messages</span>
                          </div>
                        </div>

                        {activeTab === 'favorites' && post.favoritedAt && (
                          <div className="text-xs text-teal-600 font-medium">
                            Lưu: {post.favoritedAt}
                          </div>
                        )}
                        {activeTab === 'history' && post.viewedAt && (
                          <div className="text-xs text-teal-600 font-medium">
                            Xem: {post.viewedAt}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Clear History Button */}
          {activeTab === 'history' && displayedPosts.length > 0 && (
            <div className="mt-8 text-center">
              <button className="px-6 py-3 text-red-600 border-2 border-red-600 rounded-full font-semibold hover:bg-red-600 hover:text-white transition-all duration-300">
                Xóa lịch sử
              </button>
            </div>
          )}
      </div>
    </div>
  );
}