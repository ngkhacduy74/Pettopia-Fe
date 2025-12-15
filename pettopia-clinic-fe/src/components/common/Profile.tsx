'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCustomerProfile } from "@/services/user/userService";
import { Mail, MapPin, Calendar, Phone, Home, Clock, Edit3 } from 'lucide-react';

interface User {
  id: string;
  fullname: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  address?: {
    city?: string;
    district?: string;
    ward?: string;
    description?: string;
  };
  dob?: string;
  createdAt?: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; currentIndex: number }>({
    isOpen: false,
    currentIndex: 0
  });
  const displayImages = user?.avatar_url ? [user.avatar_url] : [];

  // Determine base path for edit profile based on current route
  const getEditProfilePath = () => {
    if (pathname.includes('/admin/')) return '/admin/edit-profile';
    if (pathname.includes('/staff/')) return '/staff/edit-profile';
    if (pathname.includes('/clinic/')) return '/clinic/edit-profile';
    if (pathname.includes('/vet/')) return '/vet/edit-profile';
    return '/user/edit-profile';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const hasToken =
          typeof window !== "undefined" ? !!localStorage.getItem("authToken") : false;
        if (!hasToken) {
          setError('Vui lòng đăng nhập để xem trang này');
          router.push('/login');
          return;
        }

        const data = await getCustomerProfile();
        if (!data) {
          setError('Không tìm thấy thông tin người dùng');
          setUser(null);
          return;
        }

        const mapped: User = {
          id: data.id || data._id || data.customer_id || '',
          fullname: data.fullname || data.username || 'Người dùng',
          username: data.username,
          email: typeof data.email === 'string' ? data.email : data.email?.email_address || '',
          phone: typeof data.phone === 'string' ? data.phone : data.phone?.phone_number || '',
          avatar_url: data.avatar_url || data.avatar || undefined,
          address: data.address || { city: '', district: '', ward: '', description: '' },
          dob: data.dob || '',
          createdAt: data.createdAt || data.created_at || ''
        };

        setUser(mapped);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err?.message || 'Không thể tải thông tin người dùng');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevImage();
      if (e.key === 'ArrowRight') goToNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, displayImages]);

  const formatAddress = () => {
    if (!user?.address) return 'Chưa cập nhật';
    const parts = [
      user.address.description,
      user.address.ward,
      user.address.district,
      user.address.city
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'NN';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'NN';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, currentIndex: 0 });
  };

  const goToPrevImage = () => {
    if (!displayImages || displayImages.length === 0) return;
    setLightbox(prev => ({
      ...prev,
      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : displayImages.length - 1
    }));
  };

  const goToNextImage = () => {
    if (!displayImages || displayImages.length === 0) return;
    setLightbox(prev => ({
      ...prev,
      currentIndex: prev.currentIndex < displayImages.length - 1 ? prev.currentIndex + 1 : 0
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-5">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {error || "Không thể tải thông tin"}
          </h2>
          <Link href="/login">
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Đăng nhập
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative">
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: "url('/sampleimg/bg-green.jpg')" }}
        />

        {/* Avatar */}
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.fullname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold">
                {getInitials(user.fullname)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            {/* Name & Basic Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.fullname}</h1>
                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs">✓</span>
              </div>

              {user.username && (
                <p className="text-gray-600 mb-4">@{user.username}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{formatAddress()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Tham gia {formatDate(user.createdAt)}</span>
                </div>
              </div>

              <Link href={getEditProfilePath()}>
                <button className="px-6 py-2.5 border-2 text-gray-900 font-medium rounded-lg hover:bg-teal-600 hover:text-white transition-colors flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa hồ sơ
                </button>
              </Link>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex gap-8 overflow-x-auto">
                <button className="pb-4 border-b-2 border-gray-900 font-medium text-gray-900 whitespace-nowrap">Tổng quan</button>
                <button className="pb-4 text-gray-600 hover:text-gray-900 whitespace-nowrap">Hoạt động</button>
                <button className="pb-4 text-gray-600 hover:text-gray-900 whitespace-nowrap">Bài viết</button>
                <button className="pb-4 text-gray-600 hover:text-gray-900 whitespace-nowrap">Ảnh</button>
              </div>
            </div>

            {/* Content Area */}
            <div className="mt-8 space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chào mừng bạn đến với trang cá nhân của tôi. Tôi đam mê công nghệ và luôn tìm kiếm những điều mới mẻ để học hỏi và phát triển bản thân.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Đã cập nhật thông tin cá nhân</p>
                      <p className="text-xs text-gray-400">2 ngày trước</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Đã thêm ảnh đại diện mới</p>
                      <p className="text-xs text-gray-400">1 tuần trước</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">

            {/* Personal Info Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Thông tin cá nhân</h2>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Email</div>
                    <div className="text-sm text-gray-900 break-words">{user.email || 'Chưa cập nhật'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Số điện thoại</div>
                    <div className="text-sm text-gray-900">{user.phone || 'Chưa cập nhật'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Ngày sinh</div>
                    <div className="text-sm text-gray-900">{formatDate(user.dob)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Địa chỉ</div>
                    <div className="text-sm text-gray-900 break-words leading-relaxed">
                      {formatAddress()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Like stats + Action
            <div className="border-t border-gray-200">
              {post.likeCount > 0 && (
                <div className="px-4 py-2 flex items-center gap-2 text-xs text-gray-600">
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                    </div>
                  </div>
                  <span className="ml-1 hover:text-blue-600 cursor-pointer hover:underline">{getLikedUsersText()}</span>
                </div>
              )}

              <div className="flex items-center justify-around py-1">
                <button
                  onClick={handleToggleLike}
                  disabled={liking}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${isLikedByCurrentUser
                    ? 'text-blue-600 hover:bg-gray-100'
                    : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-60 font-semibold text-sm`}
                >
                  <svg className="w-5 h-5" fill={isLikedByCurrentUser ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                  </svg>
                  <span>{isLikedByCurrentUser ? 'Đã thích' : 'Thích'}</span>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}