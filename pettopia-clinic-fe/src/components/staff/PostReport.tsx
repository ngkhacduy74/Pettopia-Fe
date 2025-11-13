'use client'
import React, { useEffect, useState, useMemo } from 'react';
import { 
  AlertTriangle, Eye, EyeOff, MessageSquare, Heart, Flag, User, 
  Calendar, Image, Search, X 
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1/communication/staff/reported';
const getToken = () => localStorage.getItem('authToken') || '';

// API Services
const getReportedPosts = async () => {
    const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': getToken()
        }
    });
    if (!response.ok) throw new Error('Không thể tải danh sách bài viết bị báo cáo');
    return response.json();
};

const toggleHidePost = async (postId: string, isHidden: boolean) => {
    const response = await fetch(`http://localhost:3000/api/v1/communication/${postId}/hide`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'token': getToken()
        },
        body: JSON.stringify({ isHidden })
    });
    if (!response.ok) throw new Error(isHidden ? 'Không thể ẩn bài viết' : 'Không thể bỏ ẩn bài viết');
    return response.json();
};

interface Author {
    user_id: string;
    fullname: string;
    avatar: string | null;
}

interface Report {
    user_id: string;
    reason: string;
    reportedAt: string;
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

interface ReportedPost {
    post_id: string;
    author: Author;
    title: string;
    content: string;
    tags: string[];
    images: string[];
    isHidden: boolean;
    comments: Comment[];
    commentCount: number;
    likeCount: number;
    viewCount: number;
    reportCount: number;
    reports: Report[];
    createdAt: string;
    updatedAt: string;
}

export default function ReportedPostsManagement() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [posts, setPosts] = useState<ReportedPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<ReportedPost | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'hide' | 'unhide'>('hide');
    const [filterStatus, setFilterStatus] = useState<'all' | 'hidden' | 'visible'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    async function loadPosts() {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const data = await getReportedPosts();
            setPosts(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setError(e?.message || 'Không thể tải danh sách bài viết');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPosts();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openDetailModal = (post: ReportedPost) => {
        setSelectedPost(post);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedPost(null);
    };

    const openActionModal = (post: ReportedPost, action: 'hide' | 'unhide') => {
        setSelectedPost(post);
        setActionType(action);
        setIsActionModalOpen(true);
    };

    const closeActionModal = () => {
        setIsActionModalOpen(false);
        setSelectedPost(null);
    };

    const handleAction = async () => {
        if (!selectedPost) return;
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const isHidden = actionType === 'hide';
            await toggleHidePost(selectedPost.post_id, isHidden);
            setSuccessMessage(isHidden ? 'Đã ẩn bài viết thành công' : 'Đã bỏ ẩn bài viết thành công');
            await loadPosts();
            closeActionModal();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (e: any) {
            setError(e?.message || 'Không thể thực hiện thao tác');
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = useMemo(() => {
        let filtered = posts;

        if (filterStatus === 'hidden') {
            filtered = filtered.filter(p => p.isHidden);
        } else if (filterStatus === 'visible') {
            filtered = filtered.filter(p => !p.isHidden);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.content.toLowerCase().includes(query) ||
                p.author.fullname.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [posts, filterStatus, searchQuery]);

    const stats = useMemo(() => {
        return {
            total: posts.length,
            hidden: posts.filter(p => p.isHidden).length,
            visible: posts.filter(p => !p.isHidden).length,
            totalReports: posts.reduce((sum, p) => sum + p.reportCount, 0)
        };
    }, [posts]);

    return (
        <div className="min-h-screen ">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header + Stats Cards */}
                <div className="mb-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài viết bị báo cáo</h1>
                        <p className="mt-2 text-gray-600">Xem xét và xử lý các bài viết vi phạm quy định cộng đồng</p>
                    </div>

                    {/* 4 ô thống kê - Clickable để filter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`bg-white rounded-xl p-5 shadow-sm border-2 transition text-left ${
                                filterStatus === 'all' 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Tổng bài viết</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => setFilterStatus('hidden')}
                            className={`bg-white rounded-xl p-5 shadow-sm border-2 transition text-left ${
                                filterStatus === 'hidden' 
                                    ? 'border-red-500 ring-2 ring-red-200' 
                                    : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Đã ẩn</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.hidden}</p>
                                </div>
                                <div className="bg-red-100 p-3 rounded-lg">
                                    <EyeOff className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => setFilterStatus('visible')}
                            className={`bg-white rounded-xl p-5 shadow-sm border-2 transition text-left ${
                                filterStatus === 'visible' 
                                    ? 'border-green-500 ring-2 ring-green-200' 
                                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Đang hiển thị</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.visible}</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Eye className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </button>
                        
                        <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Tổng báo cáo</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                                </div>
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <Flag className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thanh tìm kiếm thu gọn */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition bg-white shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Thông báo */}
                {error && !isDetailModalOpen && !isActionModalOpen && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{error}</div>
                )}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">{successMessage}</div>
                )}

                {/* Bảng danh sách */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Danh sách bài viết ({filteredPosts.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bài viết</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Tác giả</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Báo cáo</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading && posts.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                                ) : filteredPosts.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Không tìm thấy bài viết nào</td></tr>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <tr key={post.post_id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-5">
                                                <div className="max-w-md">
                                                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{post.title}</h3>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(post.createdAt)}
                                                        {post.images.length > 0 && (
                                                            <>
                                                                <span>•</span>
                                                                <Image className="w-3 h-3" />
                                                                <span>{post.images.length} ảnh</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                                        {post.author.avatar ? (
                                                            <img src={post.author.avatar} alt={post.author.fullname} className="w-10 h-10 rounded-full object-cover" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-teal-600" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 text-center">{post.author.fullname}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-800">
                                                    <Flag className="w-4 h-4" />
                                                    <span className="font-semibold">{post.reportCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${post.isHidden
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {post.isHidden ? 'Đã ẩn' : 'Hiển thị'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center text-sm">
                                                <button
                                                    onClick={() => openDetailModal(post)}
                                                    className="text-teal-600 hover:text-teal-800 font-medium mr-4"
                                                >
                                                    Xem chi tiết
                                                </button>
                                                {post.isHidden ? (
                                                    <button
                                                        onClick={() => openActionModal(post, 'unhide')}
                                                        className="text-green-600 hover:text-green-800 font-medium"
                                                    >
                                                        Bỏ ẩn
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openActionModal(post, 'hide')}
                                                        className="text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Ẩn bài
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Chi tiết bài viết */}
            {isDetailModalOpen && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Chi tiết bài viết</h2>
                            <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="bg-gray-50 rounded-xl p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{selectedPost.title}</h3>
                                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{selectedPost.content}</p>
                                
                                {selectedPost.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedPost.tags.map((tag, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                {selectedPost.images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                        {selectedPost.images.map((img, idx) => (
                                            <img key={idx} src={img} alt="" className="w-full h-32 object-cover rounded-lg" />
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        <span>{selectedPost.likeCount} lượt thích</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{selectedPost.commentCount} bình luận</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>{selectedPost.viewCount} lượt xem</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Thông tin tác giả</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                                        {selectedPost.author.avatar ? (
                                            <img src={selectedPost.author.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-teal-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedPost.author.fullname}</p>
                                        <p className="text-sm text-gray-600">ID: {selectedPost.author.user_id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-red-700 mb-3 uppercase flex items-center gap-2">
                                    <Flag className="w-4 h-4" />
                                    Danh sách báo cáo ({selectedPost.reportCount})
                                </h3>
                                <div className="space-y-3">
                                    {selectedPost.reports.map((report, idx) => (
                                        <div key={idx} className="bg-white rounded-lg p-4 border border-red-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="text-sm font-medium text-gray-900">Người báo cáo: {report.user_id}</p>
                                                <p className="text-xs text-gray-500">{formatDate(report.reportedAt)}</p>
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Lý do:</span> {report.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={closeDetailModal}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Đóng
                            </button>
                            {selectedPost.isHidden ? (
                                <button
                                    onClick={() => {
                                        closeDetailModal();
                                        openActionModal(selectedPost, 'unhide');
                                    }}
                                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
                                >
                                    Bỏ ẩn bài viết
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        closeDetailModal();
                                        openActionModal(selectedPost, 'hide');
                                    }}
                                    className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                                >
                                    Ẩn bài viết
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xác nhận hành động */}
            {isActionModalOpen && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                                actionType === 'hide' ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                                {actionType === 'hide' ? (
                                    <EyeOff className="w-6 h-6 text-red-600" />
                                ) : (
                                    <Eye className="w-6 h-6 text-green-600" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {actionType === 'hide' ? 'Xác nhận ẩn bài viết' : 'Xác nhận bỏ ẩn bài viết'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {actionType === 'hide' 
                                    ? 'Bài viết sẽ bị ẩn khỏi cộng đồng. Người dùng sẽ không thể xem được bài viết này nữa.'
                                    : 'Bài viết sẽ được hiển thị trở lại cho cộng đồng. Người dùng có thể xem và tương tác với bài viết này.'}
                            </p>
                            
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                                    {error}
                                </div>
                            )}
                            
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm font-medium text-gray-900 mb-1">Bài viết:</p>
                                <p className="text-sm text-gray-700 line-clamp-2">{selectedPost.title}</p>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={closeActionModal}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={loading}
                                className={`px-6 py-2.5 rounded-lg font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                    actionType === 'hide'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {loading ? 'Đang xử lý...' : (actionType === 'hide' ? 'Xác nhận ẩn' : 'Xác nhận bỏ ẩn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}