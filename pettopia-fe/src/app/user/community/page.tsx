'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import từ service thực tế
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface Author {
  user_id: string;
  fullname: string;
  avatar: string | null;
}

interface Post {
  post_id: string;
  author: Author;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  isHidden: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

class CommunicationService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/communication`;
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(contentType: string = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getAllPosts(): Promise<Post[]> {
    const response = await fetch(`${this.baseUrl}/all`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Post[]>(response);
  }

  async getTrendingPosts(limit: number): Promise<Post[]> {
    const response = await fetch(`${this.baseUrl}/trending?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
    });
    return this.handleResponse<Post[]>(response);
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Parse tags that may arrive as JSON strings like "[\"thongbao\"]"
  parseTags(tags: string[]): string[] {
    if (!tags || tags.length === 0) return [];
    try {
      return tags
        .map(tag => (typeof tag === 'string' && tag.startsWith('[') ? JSON.parse(tag) : tag))
        .flat();
    } catch {
      return tags;
    }
  }
}

const communicationService = new CommunicationService();

export default function CommunityPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]); // Store all posts for local search
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const categories: Category[] = [
    { id: 'thongbao', name: 'Thông báo', color: 'bg-blue-100 text-blue-600' },
    { id: 'gopy', name: 'Góp ý', color: 'bg-orange-100 text-orange-600' },
    { id: 'tintuc', name: 'Tin tức', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'review', name: 'Review sản phẩm', color: 'bg-purple-100 text-purple-600' },
    { id: 'chiase', name: 'Chia sẻ kiến thức', color: 'bg-green-100 text-green-600' },
    { id: 'tuvan', name: 'Tư vấn', color: 'bg-pink-100 text-pink-600' }
  ];

  // Load posts khi component mount
  useEffect(() => {
    loadPosts();
    loadTrendingPosts();
  }, []);

  // Load posts khi activeTab thay đổi
  useEffect(() => {
    // Skip if allPosts is not loaded yet
    if (allPosts.length === 0) return;
    
    // Reset search query khi đổi tab
    setSearchQuery('');
    setCurrentPage(1);
    
    if (activeTab !== 'all') {
      loadPostsByTag(activeTab);
    } else {
      setPosts(allPosts);
    }
  }, [activeTab, allPosts]);

  // Search debounce
  useEffect(() => {
    // Skip if allPosts is not loaded yet
    if (allPosts.length === 0 && !searchQuery) return;
    
    const timer = setTimeout(() => {
      handleSearch();
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, allPosts]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await communicationService.getAllPosts();
      const normalized = (data || [])
        .filter(p => !p.isHidden)
        .map(p => ({ ...p, tags: communicationService.parseTags(p.tags) }));
      setAllPosts(normalized); // Store all posts
      setPosts(normalized);
    } catch (err) {
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      console.error('Error loading posts:', err);
      setAllPosts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingPosts = async () => {
    try {
        const response = await communicationService.getTrendingPosts(5);
        const postsArray = (Array.isArray(response) ? response : [])
          .map(p => ({ ...p, tags: communicationService.parseTags(p.tags) }));

        // Weekly trending by like count
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyTrending = postsArray
          .filter(p => !p.isHidden)
          .filter(p => new Date(p.createdAt) >= oneWeekAgo)
          .sort((a, b) => b.likeCount - a.likeCount)
          .slice(0, 5);

        setTrendingPosts(weeklyTrending);
    } catch (err) {
        console.error('Error loading trending posts:', err);
        setTrendingPosts([]);
    }
  };

  const loadPostsByTag = (tag: string) => {
    // Don't show loading spinner for client-side filtering
    const filtered = allPosts.filter(p => 
      (p.tags || []).map(t => String(t).toLowerCase()).includes(tag.toLowerCase())
    );
    setPosts(filtered);
  };

  const handleSearch = () => {
    // Wait for allPosts to be loaded
    if (allPosts.length === 0 && !searchQuery.trim()) {
      return;
    }
    
    if (!searchQuery.trim()) {
      // If search is empty, show all posts or filtered by tag
      if (activeTab === 'all') {
        setPosts(allPosts);
      } else {
        const filtered = allPosts.filter(p => 
          (p.tags || []).map(t => String(t).toLowerCase()).includes(activeTab.toLowerCase())
        );
        setPosts(filtered);
      }
      return;
    }
    
    try {
      // Don't show loading spinner for search (instant)
      
      // Search locally from allPosts
      const query = searchQuery.toLowerCase().trim();
      let filtered = allPosts.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const contentMatch = p.content.toLowerCase().includes(query);
        const authorMatch = p.author.fullname.toLowerCase().includes(query);
        return titleMatch || contentMatch || authorMatch;
      });
      
      // Apply tag filter if not on 'all' tab
      if (activeTab !== 'all') {
        filtered = filtered.filter(p => 
          (p.tags || []).map(t => String(t).toLowerCase()).includes(activeTab.toLowerCase())
        );
      }
      
      setPosts(filtered);
    } catch (err) {
      setError('Không thể tìm kiếm bài viết.');
      console.error('Error searching posts:', err);
      setPosts([]);
    }
  };

  const getCategoryBadge = (tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    const categoryMap: { [key: string]: { text: string; bgColor: string; textColor: string } } = {
      'thongbao': { text: 'thảo luận', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      'gopy': { text: 'góp ý', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
      'tintuc': { text: 'tin tức', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      'review': { text: 'review', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      'chiase': { text: 'download', bgColor: 'bg-green-600', textColor: 'text-white' },
      'tuvan': { text: 'tư vấn', bgColor: 'bg-pink-100', textColor: 'text-pink-700' }
    };

    const tag = tags[0].toLowerCase();
    return categoryMap[tag] || { text: tag, bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
  };

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleViewPostDetail = (postId: string) => {
    router.push(`/user/community/detailPost?id=${postId}`);
  };

  const handleCreatePost = () => {
    router.push('/user/community/create');
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Title + Search Bar + Create Button */}
          <div className="flex items-center justify-between gap-6 mb-6">
            <h1 className="text-4xl font-extrabold text-teal-800 tracking-tight whitespace-nowrap">
              Community
            </h1>
            
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              <div className="bg-white rounded-full shadow-sm border border-teal-100 px-4 py-2 flex items-center gap-3 flex-1">
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

              <button
                onClick={handleCreatePost}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                Tạo bài viết
              </button>
            </div>
          </div>

          {/* Categories Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                activeTab === 'all'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
                  activeTab === cat.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : `${cat.color} hover:shadow-md`
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && posts.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">Không có bài viết nào</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy là người đầu tiên tạo bài viết!'}
                </p>
              </div>
            )}

            {/* Posts List - Forum Style */}
            {!loading && posts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {posts
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((post, index) => {
                  const badge = getCategoryBadge(post.tags);
                  const isLastItem = index === Math.min(pageSize, posts.length - (currentPage - 1) * pageSize) - 1;
                  
                  return (
                    <div
                      key={post.post_id}
                      onClick={() => handleViewPostDetail(post.post_id)}
                      className={`flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !isLastItem ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <img
                        src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`}
                        alt={post.author.fullname}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`;
                        }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Badge + Title */}
                        <div className="flex items-start gap-2 mb-1">
                          {badge && (
                            <span className={`${badge.bgColor} ${badge.textColor} text-xs px-2 py-0.5 rounded font-medium flex-shrink-0`}>
                              {badge.text}
                            </span>
                          )}
                          <h3 className="text-base font-semibold text-orange-600 hover:text-orange-700 break-words flex-1">
                            {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                          </h3>
                        </div>

                        {/* Author + Date */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">{post.author.fullname}</span>
                          <span className="text-gray-400">·</span>
                          <span>{communicationService.formatDate(post.createdAt)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col items-end gap-2 text-sm text-gray-600 flex-shrink-0">
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{formatCount(post.likeCount)}</div>
                            <div className="text-xs text-gray-500">Replies:</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{formatCount(post.viewCount)}</div>
                            <div className="text-xs text-gray-500">Views:</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {communicationService.formatTimeAgo(post.updatedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && posts.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === 1 
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'text-teal-700 border-teal-200 hover:bg-teal-50'
                  }`}
                >
                  Trước
                </button>
                
                {Array.from({ length: Math.max(1, Math.ceil(posts.length / pageSize)) }).map((_, idx) => {
                  const page = idx + 1;
                  const totalPages = Math.ceil(posts.length / pageSize);
                  
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-colors ${
                          page === currentPage
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'border-teal-200 text-teal-700 hover:bg-teal-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(posts.length / pageSize), p + 1))}
                  disabled={currentPage >= Math.ceil(posts.length / pageSize)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage >= Math.ceil(posts.length / pageSize)
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-teal-700 border-teal-200 hover:bg-teal-50'
                  }`}
                >
                  Sau
                </button>
              </div>
            )}
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
                {trendingPosts.length === 0 ? (
                  <p className="text-gray-500 text-sm">Chưa có bài viết trending</p>
                ) : (
                  trendingPosts.map((post, index) => (
                    <div 
                      key={post.post_id} 
                      onClick={() => handleViewPostDetail(post.post_id)}
                      className="pb-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded p-2 -m-2 transition-colors"
                    >
                      <div className="flex gap-2">
                        <span className="text-teal-600 font-bold text-lg flex-shrink-0">#{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 hover:text-teal-600 line-clamp-2 break-words">
                            {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {post.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {post.viewCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}