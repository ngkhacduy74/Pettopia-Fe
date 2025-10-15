'use client'
import React, { useState } from 'react';
import UserNavbar from '@/components/UserNavbar';
interface Category {
  id: string;
  name: string;
  color: string;
}

interface Badge {
  text: string;
  color: string;
}

interface Post {
  id: number;
  category: string;
  title: string;
  author: string;
  avatar: string;
  time: string;
  threads: string | number;
  messages: string | number;
  badge?: Badge | null;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const categories: Category[] = [
    { id: 'thongbao', name: 'Thông báo', color: 'bg-blue-100 text-blue-600' },
    { id: 'gopy', name: 'Góp ý', color: 'bg-orange-100 text-orange-600' },
    { id: 'tintuc', name: 'Tin tức iNet', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'review', name: 'Review sản phẩm', color: 'bg-purple-100 text-purple-600' },
    { id: 'chiase', name: 'Chia sẻ kiến thức', color: 'bg-green-100 text-green-600' },
    { id: 'tuvan', name: 'Tư vấn cấu hình', color: 'bg-pink-100 text-pink-600' }
  ];

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      category: 'thongbao',
      title: 'Admin thú hai của VMM sắp về - Kuang2',
      author: 'duc4eyes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc4eyes',
      time: 'Aug 26, 2025',
      threads: 20,
      messages: 54,
      badge: null
    },
    {
      id: 2,
      category: 'gopy',
      title: 'Đã gửi sms vẫn chưa trả lời',
      author: 'Onikage',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=onikage',
      time: 'Today at 5:09 PM',
      threads: '3.3K',
      messages: '69.3K',
      badge: { text: 'báo lỗi', color: 'bg-red-500' }
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
      badge: { text: 'tin tức', color: 'bg-yellow-500' }
    },
    {
      id: 4,
      category: 'review',
      title: '"Bắt đầy" VF7 Plus',
      author: 'YuroR',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuror',
      time: '5 minutes ago',
      threads: '1K+',
      messages: '150.8K',
      badge: { text: 'đánh giá', color: 'bg-red-600' }
    },
    {
      id: 5,
      category: 'chiase',
      title: 'Lỗi máy tính',
      author: 'honeyz',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=honeyz',
      time: '8 minutes ago',
      threads: '1K+',
      messages: '130.5K',
      badge: { text: 'kiến thức', color: 'bg-blue-600' }
    },
    {
      id: 6,
      category: 'tuvan',
      title: 'Tài chính 20m, ít game, chủ yếu làm việc',
      author: 'bachback',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bachback',
      time: 'Today at 8:15 PM',
      threads: '5.7K',
      messages: '59.7K',
      badge: null
    }
  ]);

  // Ví dụ hàm có tham số id: number (không còn implicit any)
  const removePost = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  // Lọc bài theo tab đã chọn (activeTab là string => category ids phải là string)
  const visiblePosts = activeTab === 'all' ? posts : posts.filter(p => p.category === activeTab);

  return (
    <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
      {/* Sidebar Navigation */}
      <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-extrabold text-teal-800 mb-2 tracking-tight">
                Community
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                Kết nối, chia sẻ và học hỏi từ cộng đồng{" "}
                <span className="text-teal-600 font-semibold">yêu thú cưng</span>.
              </p>
            </div>

            <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 hover:scale-105">
              Tạo bài viết
            </button>
          </div>
        </div>



        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Đại sảnh
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`p-3 rounded-lg transition-all ${activeTab === 'all'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <span className="font-semibold">Tất cả</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTab(cat.id)}
                      className={`p-3 rounded-lg transition-all ${activeTab === cat.id
                          ? 'bg-teal-600 text-white shadow-md'
                          : `${cat.color} hover:shadow-md`
                          }`}
                    >
                      <span className="font-semibold text-sm">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {visiblePosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm border border-teal-100 p-6 hover:shadow-md transition-all cursor-pointer hover:border-teal-300"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-12 h-12 rounded-full"
                      />

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {post.badge && (
                              <span className={`${post.badge.color} text-white text-xs px-2 py-1 rounded-full font-semibold mr-2`}>
                                {post.badge.text}
                              </span>
                            )}
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-teal-600">
                              {post.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Posts */}
              <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Trending content
                </h3>
                <div className="space-y-4">
                  {/* {trendingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="pb-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-teal-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 hover:text-teal-600">
                        {post.title}
                      </h4>
                      <div className="text-xs text-gray-500">
                        <div>{post.author}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span>{post.date}</span>
                          <span className="font-semibold">Replies: {post.replies}</span>
                        </div>
                      </div>
                    </div>
                  ))} */}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowSearch(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-teal-100" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-teal-100">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="flex-1 bg-transparent outline-none text-gray-900"
                  autoFocus
                />
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}