"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { communicationService, Post, Comment } from "@/services/communication/communicationService";
import { parseJwt } from "@/utils/jwt";

interface LightboxState {
  isOpen: boolean;
  currentIndex: number;
}

export default function PostDetailPage() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [liking, setLiking] = useState<boolean>(false);
  const [lightbox, setLightbox] = useState<LightboxState>({ isOpen: false, currentIndex: 0 });

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("authToken") : null), []);
  const currentUserId = useMemo(() => {
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded?.id ?? null;
  }, [token]);

  useEffect(() => {
    if (token) communicationService.setToken(token);
  }, [token]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!postId) {
        setError("Thiếu tham số bài viết (id)");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const detail = await communicationService.getPostDetail(postId);
        setPost(detail);
      } catch (e: any) {
        console.error("Load post detail error:", e);
        setError(e?.message || "Không thể tải chi tiết bài viết.");
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [postId]);

  const parsedTags = useMemo(() => communicationService.parseTags(post?.tags || []), [post?.tags]);

  const isLikedByCurrentUser = useMemo(() => {
    if (!post || !currentUserId) return false;
    const anyLikes: any = post.likes as any;
    if (!Array.isArray(anyLikes)) return false;
    return anyLikes.some((l: any) => (typeof l === 'string' ? l === currentUserId : l?.user_id === currentUserId));
  }, [post, currentUserId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLikedUsersText = () => {
    if (!post) return '';
    const likesList = Array.isArray(post.likes)
      ? post.likes.map((l: any) =>
        typeof l === 'object' && l?.author?.fullname ? l.author.fullname : ''
      ).filter(Boolean)
      : [];

    if (likesList.length === 0) return `${post.likeCount} người`;
    if (likesList.length === 1) return likesList[0];
    if (likesList.length === 2) return `${likesList[0]} và ${likesList[1]}`;
    return `${likesList[0]}, ${likesList[1]} và ${post.likeCount - 2} người khác`;
  };

  const handleToggleLike = async () => {
    if (!postId) return;
    if (!currentUserId) {
      alert("Bạn cần đăng nhập để thích bài viết.");
      return;
    }
    try {
      setLiking(true);
      setPost((prev) => {
        if (!prev) return prev;
        const liked = isLikedByCurrentUser;
        const nextCount = liked ? Math.max(0, prev.likeCount - 1) : prev.likeCount + 1;
        let nextLikes: any[] = Array.isArray(prev.likes) ? [...prev.likes] : [];
        if (liked) {
          nextLikes = nextLikes.filter((l: any) => (typeof l === 'string' ? l !== currentUserId : l?.user_id !== currentUserId));
        } else {
          nextLikes.push(currentUserId);
        }
        return { ...prev, likeCount: nextCount, likes: nextLikes as any } as Post;
      });

      if (isLikedByCurrentUser) {
        await communicationService.unlikePost(postId);
      } else {
        await communicationService.likePost(postId);
      }
    } catch (e: any) {
      console.error("Toggle like error:", e);
      try {
        const detail = await communicationService.getPostDetail(postId);
        setPost(detail);
      } catch { }
      alert(e?.message || "Không thể cập nhật lượt thích.");
    } finally {
      setLiking(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!postId) return;
    const content = commentInput.trim();
    if (!content) return;
    if (!currentUserId) {
      alert("Bạn cần đăng nhập để bình luận.");
      return;
    }
    try {
      setSubmittingComment(true);
      await communicationService.createComment({
        post_id: postId,
        user_id: currentUserId,
        content,
      });
      setCommentInput("");
      const detail = await communicationService.getPostDetail(postId);
      setPost(detail);
    } catch (e: any) {
      console.error("Create comment error:", e);
      alert(e?.message || "Không thể gửi bình luận.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightbox({ isOpen: true, currentIndex: index });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, currentIndex: 0 });
  };

  const goToPrevImage = () => {
    if (!post?.images) return;
    setLightbox(prev => ({
      ...prev,
      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : post.images!.length - 1
    }));
  };

  const goToNextImage = () => {
    if (!post?.images) return;
    setLightbox(prev => ({
      ...prev,
      currentIndex: prev.currentIndex < post.images!.length - 1 ? prev.currentIndex + 1 : 0
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevImage();
      if (e.key === 'ArrowRight') goToNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, post?.images]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-10">
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Chi tiết bài viết</h1>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-white text-teal-700 hover:bg-cyan-50 rounded-full transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Post Card */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-cyan-100 p-8 mb-6 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex gap-6">
                {/* User Info Sidebar */}
                <div className="flex-shrink-0 w-48 hidden md:block">
                  <div className="flex flex-col items-center text-center sticky top-8">
                    {/* Avatar with gradient border */}
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-sm"></div>
                      <div className="relative w-24 h-24 rounded-full bg-white p-1">
                        <img
                          src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`}
                          alt={post.author.fullname}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`;
                          }}
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{post.author.fullname}</h3>

                    {/* Role */}
                    <p className="text-sm text-gray-500 mb-3">Member</p>

                    {/* Custom badge */}
                    <span className="text-sm bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 px-4 py-2 rounded-full font-semibold shadow-sm">
                      Pettopia
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  {/* Mobile author info */}
                  <div className="flex items-center gap-4 mb-6 md:hidden">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-sm"></div>
                      <div className="relative w-14 h-14 rounded-full bg-white p-1">
                        <img
                          src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`}
                          alt={post.author.fullname}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`;
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{post.author.fullname}</h3>
                      <p className="text-sm text-gray-500">Member</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    {/* Date */}
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{formatDate(post.createdAt)}</span>

                    {/* Share icon and Post number */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: post.title,
                              url: window.location.href
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Đã copy link!');
                          }
                        }}
                        className="text-gray-500 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-full"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">#{post.post_id || post._id}</span>
                    </div>
                  </div>

                  {/* Title - Gradient style */}
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6 break-words leading-tight">
                    {post.title}
                  </h2>

                  {/* Tags */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {parsedTags.map((tag, idx) => (
                        <span key={idx} className="text-sm bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 px-4 py-1.5 rounded-full font-medium shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-gray-700 whitespace-pre-wrap leading-8 mb-6 text-lg">
                    {post.content}
                  </div>

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {post.images.map((img, i) => (
                        <div key={i} className="relative group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                          <img
                            src={img}
                            alt={`image-${i}`}
                            className="w-full rounded-2xl object-cover cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
                            onClick={() => openLightbox(i)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions Footer */}
                  {post.likeCount > 0 && (
                    <div className="pt-4 border-t-2 border-teal-100">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">
                          <span className="font-semibold text-gray-900">{getLikedUsersText()}</span> đã thích bài viết này
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t-2 border-teal-100">
                    <button
                      onClick={handleToggleLike}
                      disabled={liking}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isLikedByCurrentUser
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 hover:from-teal-200 hover:to-cyan-200'
                        } disabled:opacity-60 disabled:transform-none`}
                    >
                      <svg className="w-5 h-5" fill={isLikedByCurrentUser ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{isLikedByCurrentUser ? 'Đã thích' : 'Thích'}</span>
                    </button>
                    <span className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="font-medium">{post.viewCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-cyan-100 p-8 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Bình luận ({post.commentCount})
              </h3>

              {/* Comment input */}
              <div className="mb-8">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-cyan-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all duration-300 text-gray-700"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !commentInput.trim()}
                    className={`px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${submittingComment || !commentInput.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                      }`}
                  >
                    {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-6">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((c) => (
                    <div key={c.comment_id} className="border-b-2 border-teal-100 pb-6 last:border-b-0 hover:bg-teal-50/30 -mx-4 px-4 py-4 rounded-2xl transition-colors duration-300">
                      <div className="flex gap-4">
                        {/* Comment author avatar (desktop) */}
                        <div className="flex-shrink-0 w-32 hidden md:block">
                          <div className="flex flex-col items-center text-center">
                            <div className="relative mb-3">
                              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-sm"></div>
                              <div className="relative w-14 h-14 rounded-full bg-white p-1">
                                <img
                                  src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`}
                                  alt={c.author?.fullname || "user"}
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`;
                                  }}
                                />
                              </div>
                            </div>
                            <span className="font-semibold text-sm text-gray-900">
                              {c.author?.fullname || "Người dùng"}
                            </span>
                            <span className="text-xs text-gray-500">Member</span>
                          </div>
                        </div>

                        {/* Comment content */}
                        <div className="flex-1 min-w-0">
                          {/* Mobile author info */}
                          <div className="flex items-center gap-3 mb-3 md:hidden">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-sm"></div>
                              <div className="relative w-10 h-10 rounded-full bg-white p-0.5">
                                <img
                                  src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`}
                                  alt={c.author?.fullname || "user"}
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`;
                                  }}
                                />
                              </div>
                            </div>
                            <span className="font-semibold text-sm text-gray-900">
                              {c.author?.fullname || "Người dùng"}
                            </span>
                          </div>

                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              {communicationService.formatTimeAgo(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-2xl border border-cyan-100">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium">Chưa có bình luận nào</p>
                    <p className="text-sm mt-2">Hãy là người đầu tiên bình luận!</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox.isOpen && post.images && post.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-teal-400 transition-colors z-10 bg-black/50 rounded-full p-2 hover:bg-black/70"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2 rounded-full shadow-lg">
            {lightbox.currentIndex + 1} / {post.images.length}
          </div>

          {/* Previous button */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-4 text-white hover:text-teal-400 transition-colors z-10 bg-black/50 rounded-full p-3 hover:bg-black/70"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <img
            src={post.images[lightbox.currentIndex]}
            alt={`Lightbox ${lightbox.currentIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-4 text-white hover:text-teal-400 transition-colors z-10 bg-black/50 rounded-full p-3 hover:bg-black/70"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}