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
    if (content.length > 450) {
      alert("Bình luận không được vượt quá 450 ký tự.");
      return;
    }
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* Back button - floating */}
      <div className="container mx-auto px-4 pt-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 hover:bg-teal-50 rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Post Card */}
            <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6 mb-4">
              <div className="flex gap-4">
                {/* User Info Sidebar */}
                <div className="flex-shrink-0 w-48 hidden md:block">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 mb-3 overflow-hidden border-2 border-teal-200">
                      <img
                        src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`}
                        alt={post.author.fullname}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`;
                        }}
                      />
                    </div>

                    {/* Username */}
                    <h3 className="font-bold text-gray-900 mb-1">{post.author.fullname}</h3>

                    {/* Role */}
                    <p className="text-xs text-gray-500 mb-3">Member</p>

                    {/* Custom badge */}
                    <span className="text-xs bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 px-3 py-1 rounded-full font-medium border border-teal-200">
                      tayto
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  {/* Mobile author info */}
                  <div className="flex items-center gap-3 mb-4 md:hidden">
                    <img
                      src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`}
                      alt={post.author.fullname}
                      className="w-10 h-10 rounded-full object-cover border-2 border-teal-200"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`;
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">{post.author.fullname}</h3>
                      <p className="text-xs text-gray-500">Member</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-3">
                    {/* Date */}
                    <span className="text-sm text-teal-600 font-medium">{formatDate(post.createdAt)}</span>

                    {/* Share icon */}
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
                        className="text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Title - Large, Teal, Bold */}
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4 break-words">{post.title}</h2>

                  {/* Tags */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {parsedTags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-gray-700 whitespace-pre-wrap leading-7 mb-4">
                    {post.content}
                  </div>

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {post.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`image-${i}`}
                          className="w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition-all hover:shadow-lg border border-teal-100"
                          onClick={() => openLightbox(i)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Reactions Footer */}
                  {post.likeCount > 0 && (
                    <div className="pt-3 border-t border-teal-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>
                          <span className="font-semibold text-teal-700">{getLikedUsersText()} đã thích bài viết này</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-teal-100">
                    <button
                      onClick={handleToggleLike}
                      disabled={liking}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isLikedByCurrentUser
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-md'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                        } disabled:opacity-60`}
                    >
                      <svg className="w-5 h-5" fill={isLikedByCurrentUser ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-medium">{isLikedByCurrentUser ? 'Đã thích' : 'Thích'}</span>
                    </button>
                    <span className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6 mb-4">
              <h3 className="text-xl font-bold text-teal-700 mb-4">Bình luận ({post.commentCount})</h3>

              {/* Comment input */}
              <div className="mb-6">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  rows={3}
                  maxLength={450}
                  className="w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-teal-50/30"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm ${commentInput.length > 400 ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                    {commentInput.length}/450 ký tự
                  </span>
                  <button
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !commentInput.trim()}
                    className={`px-5 py-2 rounded-lg font-semibold text-white transition-all shadow-md ${submittingComment || !commentInput.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                      }`}
                  >
                    {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((c) => (
                    <div key={c.comment_id} className="border-b border-teal-100 pb-4 last:border-b-0">
                      <div className="flex gap-4">
                        {/* Comment author avatar (desktop) */}
                        <div className="flex-shrink-0 w-32 hidden md:block">
                          <div className="flex flex-col items-center text-center">
                            <img
                              src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`}
                              alt={c.author?.fullname || "user"}
                              className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-teal-200"
                              onError={(e) => {
                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`;
                              }}
                            />
                            <span className="font-semibold text-sm text-gray-900">
                              {c.author?.fullname || "Người dùng"}
                            </span>
                            <span className="text-xs text-teal-600">Member</span>
                          </div>
                        </div>

                        {/* Comment content */}
                        <div className="flex-1 min-w-0">
                          {/* Mobile author info */}
                          <div className="flex items-center gap-3 mb-2 md:hidden">
                            <img
                              src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`}
                              alt={c.author?.fullname || "user"}
                              className="w-8 h-8 rounded-full object-cover border-2 border-teal-200"
                              onError={(e) => {
                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`;
                              }}
                            />
                            <span className="font-semibold text-sm text-gray-900">
                              {c.author?.fullname || "Người dùng"}
                            </span>
                          </div>

                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-teal-600 font-medium">{communicationService.formatTimeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-teal-600 text-sm">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
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
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-teal-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold bg-teal-600 bg-opacity-80 px-4 py-2 rounded-full">
            {lightbox.currentIndex + 1} / {post.images.length}
          </div>

          {/* Previous button */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-4 text-white hover:text-teal-300 transition-colors z-10"
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
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-4 text-white hover:text-teal-300 transition-colors z-10"
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