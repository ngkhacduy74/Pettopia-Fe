"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { communicationService, Post, Comment } from "@/services/communication/communicationService";
import { parseJwt } from "@/utils/jwt";

interface LightboxState {
  isOpen: boolean;
  currentIndex: number;
}

export default function PostDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get("id");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [liking, setLiking] = useState<boolean>(false);
  const [lightbox, setLightbox] = useState<LightboxState>({ isOpen: false, currentIndex: 0 });
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loadingRelated, setLoadingRelated] = useState<boolean>(false);

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

  useEffect(() => {
    const loadRelatedPosts = async () => {
      try {
        setLoadingRelated(true);
        const allPosts = await communicationService.getAllPosts();
        const filtered = allPosts
          .filter((p: Post) => !p.isHidden && p.post_id !== postId)
          .sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRelatedPosts(filtered);
      } catch (e: any) {
        console.error("Load related posts error:", e);
      } finally {
        setLoadingRelated(false);
      }
    };
    if (postId) {
      loadRelatedPosts();
    }
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
    if (content.length > 200) {
      alert("Bình luận không được vượt quá số ký tự.");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Quay lại</span>
        </button>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0 lg:max-w-3xl">
            {/* Post Card */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-4">
              {/* Images at the top */}
              {post.images && post.images.length > 0 && (
                <div>
                  <div className={`grid gap-1 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`image-${i}`}
                        className="w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        style={{ maxHeight: post.images!.length === 1 ? '500px' : '300px' }}
                        onClick={() => openLightbox(i)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Header with author info and date */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <img
                      src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`}
                      alt={post.author.fullname}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.user_id}`;
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{post.author.fullname}</h3>
                      <p className="text-xs text-gray-600">Member</p>
                      <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUserId === post.author.user_id && (
                      <button
                        onClick={() => router.push(`/user/community/edit/${post.post_id}`)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
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
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-2">
                {/* Title */}
                <h2 className="text-xl font-normal text-gray-900 mb-3 break-words">{post.title}</h2>

                {/* Tags */}
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {parsedTags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {/* Hiển thị số lượt thích */}
                {post.likeCount > 0 && (
                  <div className="flex items-center gap-2 px-4">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer hover:underline">
                      {getLikedUsersText()}
                    </span>
                  </div>
                )}

                {/* Nút Thích */}
                <div className="flex items-center justify-around py-1 border-t border-gray-200">
                  <button
                    onClick={handleToggleLike}
                    disabled={liking}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${isLikedByCurrentUser
                        ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-100'
                      } disabled:opacity-60 font-semibold text-sm`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isLikedByCurrentUser ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                      />
                    </svg>
                    <span>{isLikedByCurrentUser ? 'Đã thích' : 'Thích'}</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-4">
                {/* Comment input */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex gap-3">
                    <img
                      src={currentUserId ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
                      alt="You"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Thêm bình luận..."
                        rows={1}
                        maxLength={200}
                        className="w-full px-0 py-0 border-0 focus:outline-none focus:ring-0 resize-none text-sm placeholder-gray-500"
                        onFocus={(e) => {
                          e.target.rows = 3;
                        }}
                        onBlur={(e) => {
                          if (!commentInput.trim()) e.target.rows = 1;
                        }}
                      />
                      {commentInput.trim() && (
                        <div className="flex justify-end items-center mt-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={handleSubmitComment}
                            disabled={submittingComment || !commentInput.trim()}
                            className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all ${submittingComment || !commentInput.trim()
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                          >
                            {submittingComment ? "Đang gửi..." : "Đăng"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments list */}
                <div className="divide-y divide-gray-200">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((c) => (
                      <div key={c.comment_id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                          <img
                            src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`}
                            alt={c.author?.fullname || "user"}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.user_id || 'user'}`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-sm text-gray-900 hover:text-blue-600 cursor-pointer">
                                  {c.author?.fullname || "Người dùng"}
                                </span>
                                <span className="text-xs text-gray-500">• {communicationService.formatTimeAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-xs text-gray-600">Member</p>
                            </div>
                            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap leading-relaxed">{c.content}</p>

                            {/* Comment actions */}
                            <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-gray-600">
                              <button className="hover:text-blue-600 transition-colors">Thích</button>
                              <button className="hover:text-blue-600 transition-colors">Trả lời</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500 text-sm">
                      Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </div>
                  )}
                </div>
              </div>
              </div>
          </main>

          {/* Right Sidebar - Related Posts */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-900">Xem bài viết khác</h3>
              </div>

              <div className="divide-y divide-gray-200">
                {loadingRelated ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Đang tải...</div>
                ) : relatedPosts.length > 0 ? (
                  relatedPosts.map((relatedPost) => (
                    <div
                      key={relatedPost.post_id}
                      onClick={() => router.push(`/user/community/detail?id=${relatedPost.post_id}`)}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-xs text-gray-500">{communicationService.formatTimeAgo(relatedPost.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">Không có bài viết nào</div>
                )}
              </div>

              {relatedPosts.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/user/community')}
                    className="w-full text-sm font-semibold text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    Xem tất cả bài viết
                  </button>
                </div>
              )}
            </div>
          </aside>
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
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold bg-gray-800 bg-opacity-80 px-4 py-2 rounded-full">
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
    </div>
  );
}