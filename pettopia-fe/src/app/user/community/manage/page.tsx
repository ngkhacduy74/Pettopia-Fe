'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface Author {
  user_id: string;
  fullname: string;
  avatar: string | null;
}

interface Comment {
  comment_id: string;
  author: Author;
  content: string;
  likes: any[];
  reports: any[];
  isHidden: boolean;
  isDeleted: boolean;
  createdAt: string;
}

interface Report {
  user_id: string;
  reason: string;
  reportedAt: string;
}

interface Post {
  post_id: string;
  author: Author;
  title: string;
  content: string;
  tags?: string[];
  images?: string[];
  isHidden?: boolean;
  comments: Comment[];
  commentCount: number;
  likeCount: number;
  reportCount: number;
  viewCount?: number;
  reports: Report[];
  createdAt?: string;
  updatedAt?: string;
}

export default function ManagePostsPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'reports' | 'likes'>('date');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const parseJwt = (token: string | null) => {
      if (!token) return null;
      try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      } catch (e) {
        console.error('Failed to parse JWT', e);
        return null;
      }
    };

    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('authToken');
    let id = localStorage.getItem('userId');
    if (!id && token) {
      const decoded = parseJwt(token);
      const resolved = decoded?.userId ?? decoded?.id ?? decoded?.sub ?? null;
      if (resolved) {
        id = String(resolved);
        localStorage.setItem('userId', id);
      }
    }
    if (id) {
      setUserId(id);
      fetchPosts(id);
    }
  }, []);

  const fetchPosts = async (uid: string) => {
    try {
      setLoading(true);
      const apiUrl = `${API_BASE_URL}/communication/user/${uid}`;
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Không thể tải danh sách bài viết (HTTP ${response.status})`);
      }
      const data = await response.json();
      const postsData = Array.isArray(data) ? data : [];
      setPosts(postsData);
      setError(null);
    } catch (err) {
      setPosts([]);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isHidden?: boolean) => {
    if (isHidden) return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
    return 'bg-green-500/20 text-green-700 border-green-500/30';
  };

  const getStatusText = (isHidden?: boolean) => {
    return isHidden ? 'Đã ẩn' : 'Đang hiển thị';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa rõ';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const filteredPosts = posts
    .filter((post) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author.fullname.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (filterStatus === 'all') return true;
      if (filterStatus === 'visible') return !post.isHidden;
      if (filterStatus === 'hidden') return post.isHidden;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      } else if (sortBy === 'reports') {
        return b.reportCount - a.reportCount;
      } else if (sortBy === 'likes') {
        return b.likeCount - a.likeCount;
      }
      return 0;
    });

  const handleViewDetails = (postId: string) => {
    const post = posts.find(p => p.post_id === postId);
    if (post) {
      setSelectedPost(post);
      setShowDetailModal(true);
    }
  };

  const handleGoToDetailPage = (postId: string) => {
    router.push(`/user/community/detailPost?id=${postId}`);
  };

  const handleDeleteClick = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/communication/posts/${postToDelete.post_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to delete post');
      setPosts(prev => prev.filter(post => post.post_id !== postToDelete.post_id));
      setDeleteModalOpen(false);
      setPostToDelete(null);
      alert('Xóa bài viết thành công!');
    } catch (error: any) {
      console.error('Delete post error:', error);
      alert('Có lỗi xảy ra khi xóa bài viết: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  const handleToggleVisibility = async (post: Post) => {
    try {
      const endpoint = post.isHidden ? 'unhide' : 'hide';
      const response = await fetch(`${API_BASE_URL}/communication/posts/${post.post_id}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to ${endpoint} post`);
      if (userId) fetchPosts(userId);
    } catch (error: any) {
      console.error('Toggle visibility error:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách bài viết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => userId && fetchPosts(userId)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">Danh sách bài viết của bạn</h1>
              <p className="text-gray-600">Quản lý và theo dõi tất cả bài viết của bạn ({posts.length} bài viết)</p>
            </div>
            <button
              onClick={() => router.push('/user/create-post')}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Tạo bài viết mới
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg p-3 text-white">
              <div className="text-teal-100 text-sm font-medium mb-1">Bài viết của bạn</div>
              <div className="text-3xl font-bold">{posts.length}</div>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg p-3 text-white">
              <div className="text-green-100 text-sm font-medium mb-1">Đang hiển thị</div>
              <div className="text-3xl font-bold">{posts.filter(p => !p.isHidden).length}</div>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg p-3 text-white">
              <div className="text-orange-100 text-sm font-medium mb-1">Đã ẩn</div>
              <div className="text-3xl font-bold">{posts.filter(p => p.isHidden).length}</div>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg p-3 text-white">
              <div className="text-red-100 text-sm font-medium mb-1">Có báo cáo</div>
              <div className="text-3xl font-bold">{posts.filter(p => p.reportCount > 0).length}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-700 font-medium"
              >
                <option value="date">Mới nhất</option>
                <option value="reports">Nhiều báo cáo nhất</option>
                <option value="likes">Nhiều like nhất</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-teal-50'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterStatus('visible')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'visible'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-teal-50'
                }`}
              >
                Đang hiển thị
              </button>
              <button
                onClick={() => setFilterStatus('hidden')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'hidden'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-teal-50'
                }`}
              >
                Đã ẩn
              </button>
            </div>
          </div>
        </div>

        {/* Post List - Table View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-200 px-6 py-3">
            <div className="flex items-center gap-6 text-xs font-bold text-teal-700 uppercase tracking-wider">
              <div className="w-64">Tiêu đề bài viết</div>
              <div className="w-32">Ngày đăng</div>
              <div className="w-32">Trạng thái</div>
              <div className="ml-auto text-right pr-2">Hành động</div>
            </div>
          </div>

          {/* List Body */}
          <div className="divide-y divide-gray-100">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Không có bài viết nào
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center gap-6 px-4 py-3">
                    {/* Tiêu đề - Click để xem trang chi tiết */}
                    <div className="w-64">
                      <button
                        onClick={() => handleGoToDetailPage(post.post_id)}
                        className="text-left font-semibold text-gray-900 hover:text-teal-600 transition-colors truncate w-full"
                      >
                        {truncateTitle(post.title)}
                      </button>
                    </div>

                    {/* Ngày đăng */}
                    <div className="w-32 text-sm text-gray-600">
                      {formatDate(post.createdAt)}
                    </div>

                    {/* Trạng thái */}
                    <div className="w-32">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(post.isHidden)}`}>
                        {getStatusText(post.isHidden)}
                      </span>
                    </div>

                    {/* Hành động */}
                    <div className="flex gap-1 ml-auto">
                      <button
                        onClick={() => handleViewDetails(post.post_id)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Xem nhanh"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(post)}
                        className={`p-2 rounded-lg transition-colors ${
                          post.isHidden ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'
                        }`}
                        title={post.isHidden ? 'Hiện bài viết' : 'Ẩn bài viết'}
                      >
                        {post.isHidden ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(post, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPost.title}</h2>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPost.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPost.author.user_id}`}
                      alt={selectedPost.author.fullname}
                      className="w-10 h-10 rounded-full border-2 border-teal-100"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{selectedPost.author.fullname}</div>
                      <div className="text-sm text-gray-500">{formatDate(selectedPost.createdAt)}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-6 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <div className="text-lg font-bold text-gray-900">{selectedPost.viewCount || 0}</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${selectedPost.reportCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {selectedPost.reportCount}
                  </div>
                  <div className="text-xs text-gray-500">Reports</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Nội dung bài viết</h3>
                <div className="prose max-w-none bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
              </div>

              {selectedPost.images && selectedPost.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">Hình ảnh</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPost.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPost.reports && selectedPost.reports.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    Báo cáo ({selectedPost.reports.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedPost.reports.map((report, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="font-medium text-red-900 mb-1">{report.reason}</div>
                        <div className="text-red-700 text-xs">{formatDate(report.reportedAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleGoToDetailPage(selectedPost.post_id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 font-semibold shadow-md transition-all"
                >
                  Xem trang chi tiết
                </button>
                {!selectedPost.isHidden ? (
                  <button
                    onClick={() => {
                      handleToggleVisibility(selectedPost);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold shadow-md transition-all"
                  >
                    Ẩn bài viết
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleToggleVisibility(selectedPost);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-md transition-all"
                  >
                    Hiện bài viết
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeleteClick(selectedPost, new MouseEvent('click') as any);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold shadow-md transition-all"
                >
                  Xóa vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && postToDelete && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-teal-500 to-green-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Xác nhận xóa bài viết</h3>
                  <p className="text-green-100 text-sm mt-1">Hành động này không thể hoàn tác</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-gray-900 mb-2">{postToDelete.title}</h4>
                <p className="text-gray-600 text-sm">{postToDelete.content.substring(0, 150)}...</p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      Bạn có chắc chắn muốn xóa bài viết này?
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Tất cả dữ liệu bao gồm bình luận, lượt thích sẽ bị xóa vĩnh viễn.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang xóa...
                    </>
                  ) : (
                    'Xác nhận xóa'
                  )}
                </button>
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}