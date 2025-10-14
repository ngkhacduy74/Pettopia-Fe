'use client'
import React, { useState } from 'react';
import UserNavbar from '@/components/UserNavbar';
export default function PostDetailPage() {
    const [liked, setLiked] = useState(false);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState(1250);
    const [replyText, setReplyText] = useState('');
    const [replies, setReplies] = useState([
        {
            id: 1,
            author: 'Onikage',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=onikage',
            time: '2 hours ago',
            content: 'Em cũng gặp tình trạng này rồi. Đã contact support nhưng phải chờ khá lâu. Mong sớm được giải quyết!',
            likes: 45,
            liked: false
        },
        {
            id: 2,
            author: 'duc4eyes',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc4eyes',
            time: '1 hour ago',
            content: 'Mình khuyến nghị hãy thử liên hệ qua facebook của họ, thường được phản hồi nhanh hơn.',
            likes: 82,
            liked: false
        },
        {
            id: 3,
            author: 'honeyz',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=honeyz',
            time: '30 minutes ago',
            content: 'Cảm ơn mọi người. Sẽ thử theo hướng dẫn của các bạn.',
            likes: 23,
            liked: false
        }
    ]);

    const post = {
        id: 2,
        category: 'gopy',
        categoryName: 'Góp ý',
        categoryColor: 'bg-orange-100 text-orange-600',
        title: 'Đã gửi sms vẫn chưa trả lời',
        author: 'Onikage',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=onikage',
        time: 'Today at 5:09 PM',
        badge: { text: 'báo lỗi', color: 'bg-red-500' },
        content: `Em gửi SMS về hỗ trợ từ hôm qua nhưng cho tới giờ vẫn chưa nhận được phản hồi nào. 
        
Tình hình là em có vấn đề với tài khoản không thể đăng nhập được, đã thử reset password nhưng vẫn không được. Em rất cần sự giúp đỡ từ team support để có thể tiếp tục sử dụng dịch vụ.

Mong team support có thể sớm xem xét và hỗ trợ. Cảm ơn!`,
        threads: '3.3K',
        messages: '69.3K',
        followers: 1240,
        views: 15240
    };

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    };

    const handleReply = () => {
        if (replyText.trim()) {
            const newReply = {
                id: replies.length + 1,
                author: 'You',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
                time: 'just now',
                content: replyText,
                likes: 0,
                liked: false
            };
            setReplies([newReply, ...replies]);
            setReplyText('');
        }
    };

    const handleLikeReply = (id) => {
        setReplies(replies.map(reply =>
            reply.id === id
                ? { ...reply, liked: !reply.liked, likes: reply.liked ? reply.likes - 1 : reply.likes + 1 }
                : reply
        ));
    };

    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
           {/* Sidebar */}
            <UserNavbar showSearch={showSearch} setShowSearch={setShowSearch} />
            {/* Main Content */}

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white border-b border-teal-200 sticky top-0 z-40 shadow-sm">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-teal-800">Chi tiết bài viết</h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-8">
                    {/* Post Detail */}
                    <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-8 mb-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex gap-4 flex-1">
                                <img
                                    src={post.avatar}
                                    alt={post.author}
                                    className="w-14 h-14 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-semibold text-lg text-gray-900">{post.author}</span>
                                        <span className="text-sm text-gray-500">@{post.author.toLowerCase()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span>{post.time}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{post.views.toLocaleString()} lượt xem</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>

                        {/* Title and Badge */}
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-3">
                                {post.badge && (
                                    <span className={`${post.badge.color} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                                        {post.badge.text}
                                    </span>
                                )}
                                <span className={`${post.categoryColor} text-xs px-3 py-1 rounded-full font-semibold`}>
                                    {post.categoryName}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                {post.title}
                            </h2>
                        </div>

                        {/* Content */}
                        <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                            {post.content}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 py-4 border-t border-b border-gray-200 mb-6 text-sm">
                            <div>
                                <span className="font-semibold text-gray-900">{post.threads}</span>
                                <span className="text-gray-600 ml-2">Threads</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">{post.messages}</span>
                                <span className="text-gray-600 ml-2">Messages</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">{post.followers}</span>
                                <span className="text-gray-600 ml-2">Followers</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pb-4 border-b border-gray-200">
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                                <svg className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className={liked ? 'text-red-500 font-semibold' : ''}>{likeCount}</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-blue-50 rounded-lg transition-colors group">
                                <svg className="w-5 h-5 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{replies.length}</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-green-50 rounded-lg transition-colors group">
                                <svg className="w-5 h-5 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.589 12.438 10 11.166 10 9.5 10 5.91 7.716 3 5 3c-2.716 0-5 2.91-5 6.5S2.284 16 5 16h.341m4.342-12.342A10.988 10.988 0 0119 10c0 5.493-4.671 9.951-10.341 9.951M9.026 9.026l3.316 3.316m0-3.316l-3.316 3.316" />
                                </svg>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    {/* Reply Box */}
                    <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6 mb-8">
                        <div className="flex gap-4 mb-4">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                                alt="You"
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Chia sẻ ý kiến của bạn..."
                                    rows="4"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 outline-none focus:border-teal-300 focus:bg-white transition-colors resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button className="px-6 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                                Hủy
                            </button>
                            <button
                                onClick={handleReply}
                                disabled={!replyText.trim()}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                            >
                                Gửi
                            </button>
                        </div>
                    </div>

                    {/* Replies */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {replies.length} câu trả lời
                        </h3>
                        {replies.map((reply) => (
                            <div key={reply.id} className="bg-white rounded-xl shadow-sm border border-teal-100 p-6 hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <img
                                        src={reply.avatar}
                                        alt={reply.author}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="font-semibold text-gray-900">{reply.author}</span>
                                                <span className="text-sm text-gray-500 ml-2">@{reply.author.toLowerCase()}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{reply.time}</span>
                                        </div>
                                        <p className="text-gray-700 mb-3 leading-relaxed">
                                            {reply.content}
                                        </p>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleLikeReply(reply.id)}
                                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors group"
                                            >
                                                <svg className={`w-4 h-4 transition-colors ${reply.liked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'}`} fill={reply.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span className={reply.liked ? 'text-red-500' : ''}>{reply.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span>Trả lời</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Related Posts */}
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    id: 1,
                                    category: 'gopy',
                                    categoryName: 'Góp ý',
                                    categoryColor: 'bg-orange-100 text-orange-600',
                                    title: 'Vấn đề đăng nhập không ổn định',
                                    author: 'duc4eyes',
                                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc4eyes',
                                    time: '3 days ago',
                                    messages: '45.2K'
                                },
                                {
                                    id: 2,
                                    category: 'chiase',
                                    categoryName: 'Chia sẻ kiến thức',
                                    categoryColor: 'bg-green-100 text-green-600',
                                    title: 'Cách khắc phục lỗi tài khoản hiệu quả',
                                    author: 'honeyz',
                                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=honeyz',
                                    time: '1 week ago',
                                    messages: '67.8K'
                                },
                                {
                                    id: 3,
                                    category: 'tuvan',
                                    categoryName: 'Tư vấn cấu hình',
                                    categoryColor: 'bg-pink-100 text-pink-600',
                                    title: 'Liên hệ support như thế nào để được hỗ trợ nhanh?',
                                    author: 'bachback',
                                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bachback',
                                    time: '5 days ago',
                                    messages: '32.1K'
                                },
                                {
                                    id: 4,
                                    category: 'tintuc',
                                    categoryName: 'Tin tức iNet',
                                    categoryColor: 'bg-cyan-100 text-cyan-600',
                                    title: 'Cập nhật hệ thống bảo mật mới nhất',
                                    author: 'DHD',
                                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dhd',
                                    time: '2 days ago',
                                    messages: '89.5K'
                                }
                            ].map((relatedPost) => (
                                <div
                                    key={relatedPost.id}
                                    className="bg-white rounded-xl shadow-sm border border-teal-100 p-5 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex gap-3 mb-3">
                                        <img
                                            src={relatedPost.avatar}
                                            alt={relatedPost.author}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`${relatedPost.categoryColor} text-xs px-2 py-1 rounded-full font-semibold`}>
                                                    {relatedPost.categoryName}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                <span>{relatedPost.author}</span>
                                                <span className="mx-1">•</span>
                                                <span>{relatedPost.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-teal-600 transition-colors">
                                        {relatedPost.title}
                                    </h4>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">{relatedPost.messages}</span>
                                        <span className="ml-1">Messages</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}