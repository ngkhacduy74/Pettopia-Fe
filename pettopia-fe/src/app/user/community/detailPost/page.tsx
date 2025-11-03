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
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Post Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
              <div className="flex gap-4">
                {/* User Info Sidebar */}
                <div className="flex-shrink-0 w-48 hidden md:block">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gray-100 mb-3 overflow-hidden">
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
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium">
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
                      className="w-10 h-10 rounded-full object-cover"
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
                    <span className="text-sm text-gray-600">{formatDate(post.createdAt)}</span>

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
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-500">#{post.post_id || post._id}</span>
                    </div>
                  </div>

                  {/* Title - Large, Red, Bold */}
                  <h2 className="text-3xl font-bold text-red-600 mb-4 break-words">{post.title}</h2>

                  {/* Tags */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {parsedTags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
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
                          className="w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openLightbox(i)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Thread link */}
                  {/* {post.thread_url && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-700">
                        Thread cũ{" "}
                        <a 
                          href={post.thread_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          Xem tại đây
                        </a>
                      </p>
                    </div>
                  )} */}

                  {/* Reactions Footer */}
                  {post.likeCount > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">

                        <span>
                          <span className="font-semibold text-gray-900">{getLikedUsersText()} đã thích bài viết này</span>
                        </span>

                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleToggleLike}
                      disabled={liking}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isLikedByCurrentUser
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-60`}
                    >
                      <svg className="w-5 h-5" fill={isLikedByCurrentUser ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-medium">{isLikedByCurrentUser ? 'Đã thích' : 'Thích'}</span>
                    </button>
                    <span className="flex items-center gap-1 text-sm text-gray-600">
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bình luận ({post.commentCount})</h3>

              {/* Comment input */}
              <div className="mb-6">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !commentInput.trim()}
                    className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors ${submittingComment || !commentInput.trim()
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
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
                    <div key={c.comment_id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex gap-4">
                        {/* Comment author avatar (desktop) */}
                        <div className="flex-shrink-0 w-32 hidden md:block">
                          <div className="flex flex-col items-center text-center">
                            <img
                              src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`}
                              alt={c.author?.fullname || "user"}
                              className="w-12 h-12 rounded-full object-cover mb-2"
                              onError={(e) => {
                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`;
                              }}
                            />
                            <span className="font-semibold text-sm text-gray-900">
                              {c.author?.fullname || "Người dùng"}
                            </span>
                            <span className="text-xs text-gray-500">Member</span>
                          </div>
                        </div>

                        {/* Comment content */}
                        <div className="flex-1 min-w-0">
                          {/* Mobile author info */}
                          <div className="flex items-center gap-3 mb-2 md:hidden">
                            <img
                              src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`}
                              alt={c.author?.fullname || "user"}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`;
                              }}
                            />
                            <span className="font-semibold text-sm text-gray-900">
                              {c.author?.fullname || "Người dùng"}
                            </span>
                          </div>

                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-gray-600">{communicationService.formatTimeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
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
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {lightbox.currentIndex + 1} / {post.images.length}
          </div>

          {/* Previous button */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
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
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}