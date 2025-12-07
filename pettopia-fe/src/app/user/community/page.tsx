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
      thongbao: 'bg-pink-100 text-pink-700',
      gopy: 'bg-orange-100 text-orange-700',
      tintuc: 'bg-blue-100 text-blue-700',
      review: 'bg-purple-100 text-purple-700',
      chiase: 'bg-green-100 text-green-700',
      tuvan: 'bg-pink-100 text-pink-700',
      lifestyle: 'bg-pink-100 text-pink-700',
      sports: 'bg-blue-100 text-blue-700',
      business: 'bg-green-100 text-green-700',
    };
    return colors[tag.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Đang tải bài viết...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Tìm kiếm bài viết"
                  className="w-full sm:w-80 md:w-96 pl-11 pr-4 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 placeholder-gray-500"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => router.push('/user/community/create')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-full transition text-sm shadow-md"
                aria-label="Tạo bài viết mới"
              >
                + Viết bài mới
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Blog Posts */}
          <div className="lg:col-span-3">
            {/* Blog Cards */}
            <div className="space-y-8">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-20 text-gray-500 text-xl">
                  Không tìm thấy bài viết nào
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const firstImage = post.images?.[0];
                  const tag = post.tags?.[0]?.toLowerCase();
                  const excerpt = post.content?.substring(0, 200) || "Xem chi tiết để đọc nội dung bài viết...";
                  const date = new Date(post.createdAt);
                  const authorName = post.author?.fullname || post.author?.user_id || 'Ẩn danh';

                  return (
                    <article
                      key={post.post_id}
                      onClick={() => router.push(`/user/community/detail?id=${post.post_id}`)}
                      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                      role="article"
                      aria-labelledby={`post-title-${post.post_id}`}
                    >
                      <div className="flex flex-col md:flex-row gap-4 p-4">
                        {/* Image */}
                        <div className="relative w-full md:w-48 h-60 md:h-40 flex-shrink-0 overflow-hidden bg-gray-100 rounded-md">
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={post.title || 'Hình ảnh bài viết'}
                              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
                              <span className="text-6xl opacity-30">📝</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                          {/* Category Tag */}
                          {tag && (
                            <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold mb-3 w-fit ${getCategoryColor(tag)}`}>
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </span>
                          )}

                          {/* Title */}
                          <h3
                            id={`post-title-${post.post_id}`}
                            className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition mb-2 line-clamp-3 break-words overflow-hidden"
                          >
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 break-words overflow-hidden">
                            {excerpt}
                            {post.content && post.content.length > 200 && '...'}
                          </p>

                          {/* Author and Date */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">{authorName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {/* Tags */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tags phổ biến</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 15).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-teal-100 hover:text-teal-700 text-gray-700 text-sm rounded-md transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>© 2025 Community Blog — {posts.length} bài viết và đang phát triển</p>
        </div>
      </div>
    </div>
  );
}