'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { communicationService } from '@/services/communication/communicationService';

const SearchIcon = ({ size = 18, className = '', ...props }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) communicationService.setToken(token);

    const loadPosts = async () => {
      try {
        const data = await communicationService.getAllPosts();
        const normalized = (Array.isArray(data) ? data : [])
          .filter((p: any) => !p.isHidden)
          .map((p: any) => ({
            ...p,
            tags: communicationService.parseTags(p.tags || []),
            images: p.images || []
          }))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setPosts(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const getCategoryColor = (tag: string) => {
    const colors: Record<string, string> = {
      thongbao: 'bg-pink-100 text-pink-700 border-pink-200',
      gopy: 'bg-orange-100 text-orange-700 border-orange-200',
      tintuc: 'bg-blue-100 text-blue-700 border-blue-200',
      review: 'bg-purple-100 text-purple-700 border-purple-200',
      chiase: 'bg-green-100 text-green-700 border-green-200',
      tuvan: 'bg-teal-100 text-teal-700 border-teal-200',
      lifestyle: 'bg-rose-100 text-rose-700 border-rose-200',
      sports: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      business: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[tag.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <div className="text-xl text-gray-600 font-medium">Đang tải bài viết...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Bar - Centered on mobile, left on desktop */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Tìm kiếm bài viết"
                  className="w-full sm:w-96 pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Create Button */}
            <div className="flex items-center gap-3 justify-center sm:justify-end">
              <button
                onClick={() => router.push('/user/community/create')}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                aria-label="Tạo bài viết mới"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">+</span>
                  <span>Viết bài mới</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Blog Posts - Centered */}
          <div className="lg:col-span-8 lg:col-start-1">
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4 opacity-30">🔍</div>
                  <div className="text-gray-500 text-xl font-medium">Không tìm thấy bài viết nào</div>
                  <div className="text-gray-400 text-sm mt-2">Thử tìm kiếm với từ khóa khác</div>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const firstImage = post.images?.[0];
                  const tag = post.tags?.[0]?.toLowerCase();
                  const excerpt = post.content?.substring(0, 180) || "Xem chi tiết để đọc nội dung bài viết...";
                  const date = new Date(post.createdAt);
                  const authorName = post.author?.fullname || post.author?.user_id || 'Ẩn danh';

                  return (
                    <article
                      key={post.post_id}
                      onClick={() => router.push(`/user/community/detail?id=${post.post_id}`)}
                      className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-teal-200"
                      role="article"
                      aria-labelledby={`post-title-${post.post_id}`}
                    >
                      <div className="flex flex-col md:flex-row gap-5 p-5">
                        {/* Image */}
                        <div className="relative w-full md:w-56 h-56 md:h-44 flex-shrink-0 overflow-hidden bg-gray-100 rounded-xl">
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={post.title || 'Hình ảnh bài viết'}
                              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <img
                              src="/sampleimg/book.jpg"
                              alt="Placeholder"
                              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          {/* Category Tag */}
                          {tag && (
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold mb-3 w-fit border ${getCategoryColor(tag)} uppercase tracking-wide`}>
                              {tag}
                            </span>
                          )}

                          {/* Title */}
                          <h3
                            id={`post-title-${post.post_id}`}
                            className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-3 line-clamp-2 leading-tight"
                          >
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                            {excerpt}
                            {post.content && post.content.length > 180 && '...'}
                          </p>

                          {/* Author and Date */}
                          <div className="flex items-center gap-5 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {authorName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-700">{authorName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar - Right aligned */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Tags */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
       
                  <span>Tags phổ biến</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 15).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-4 py-2 bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 hover:text-teal-700 text-gray-700 text-sm rounded-full transition-all font-medium hover:shadow-sm"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4"> Thống kê</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng bài viết</span>
                    <span className="text-xl font-bold text-teal-600">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kết quả tìm kiếm</span>
                    <span className="text-xl font-bold text-blue-600">{filteredPosts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}