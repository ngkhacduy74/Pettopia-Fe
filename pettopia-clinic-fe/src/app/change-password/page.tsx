'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { changePassword } from '@/services/auth/authService';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'Vui lòng nhập mật khẩu mới';
    }
    if (password.length < 6) {
      return 'Mật khẩu phải dài ít nhất 6 ký tự';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu cần ít nhất 1 ký tự viết hoa (A-Z)';
    }
    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu cần ít nhất 1 ký tự thường (a-z)';
    }
    if (!/\d/.test(password)) {
      return 'Mật khẩu cần ít nhất 1 số (0-9)';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Mật khẩu cần ít nhất 1 ký tự đặc biệt (!@#$%^&*)';
    }
    return null;
  };

  const handlePastePrevent = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.error('Không được phép dán vào trường này', {
      duration: 3000,
      position: 'top-right',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // Validation
    if (!oldPassword) {
      errors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      }
    }

    if (!reEnterPassword) {
      errors.reEnterPassword = 'Vui lòng nhập lại mật khẩu mới';
    } else if (reEnterPassword !== newPassword) {
      errors.reEnterPassword = 'Mật khẩu nhập lại không khớp';
    }

    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Object.values(errors).forEach((error) => {
        toast.error(error, {
          duration: 3000,
          position: 'top-right',
        });
      });
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);
      // Call API to change password
      const response = await changePassword({
        oldPassword,
        newPassword,
      });

      console.log('Change password response:', response);

      toast.success('Đổi mật khẩu thành công!', {
        duration: 3000,
        position: 'top-right',
      });

      // Reset form
      setOldPassword('');
      setNewPassword('');
      setReEnterPassword('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/user/profile');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đổi mật khẩu thất bại';
      console.error('Change password error:', error);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-900 mb-2">Đổi mật khẩu</h1>
          <p className="text-teal-700">Cập nhật mật khẩu của bạn để giữ an toàn cho tài khoản</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          {/* Form */}
          <div className="bg-white/40 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-white/60">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Old Password */}
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-teal-900 mb-2">
                  Mật khẩu cũ
                </label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white/60 border rounded-lg text-teal-900 placeholder:text-teal-600 focus:bg-white focus:ring-2 focus:outline-none transition-all text-sm ${
                      fieldErrors.oldPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                        : 'border-teal-200 focus:border-teal-500 focus:ring-teal-100'
                    }`}
                    placeholder="Nhập mật khẩu cũ"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showOldPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" fillRule="evenodd" />
                        <path d="M15.171 13.576l1.474 1.474a1 1 0 001.414-1.414l-2.99-2.99a.999.999 0 00-.417-.118h-.001a1 1 0 00-.958.659 13.83 13.83 0 01-1.996 3.093 3.998 3.998 0 01-5.396-5.396 13.821 13.821 0 013.09-1.994 1 1 0 00.53-1.428 1 1 0 00-1.298-.36 15.821 15.821 0 00-3.493 2.268 6 6 0 008.067 8.067z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-teal-900 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white/60 border rounded-lg text-teal-900 placeholder:text-teal-600 focus:bg-white focus:ring-2 focus:outline-none transition-all text-sm ${
                      fieldErrors.newPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                        : 'border-teal-200 focus:border-teal-500 focus:ring-teal-100'
                    }`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" fillRule="evenodd" />
                        <path d="M15.171 13.576l1.474 1.474a1 1 0 001.414-1.414l-2.99-2.99a.999.999 0 00-.417-.118h-.001a1 1 0 00-.958.659 13.83 13.83 0 01-1.996 3.093 3.998 3.998 0 01-5.396-5.396 13.821 13.821 0 013.09-1.994 1 1 0 00.53-1.428 1 1 0 00-1.298-.36 15.821 15.821 0 00-3.493 2.268 6 6 0 008.067 8.067z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Re-enter Password */}
              <div>
                <label htmlFor="reEnterPassword" className="block text-sm font-medium text-teal-900 mb-2">
                  Nhập lại mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="reEnterPassword"
                    type={showReEnterPassword ? 'text' : 'password'}
                    value={reEnterPassword}
                    onChange={(e) => setReEnterPassword(e.target.value)}
                    onPaste={handlePastePrevent}
                    className={`w-full px-4 py-2.5 bg-white/60 border rounded-lg text-teal-900 placeholder:text-teal-600 focus:bg-white focus:ring-2 focus:outline-none transition-all text-sm ${
                      fieldErrors.reEnterPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                        : 'border-teal-200 focus:border-teal-500 focus:ring-teal-100'
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowReEnterPassword(!showReEnterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showReEnterPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" fillRule="evenodd" />
                        <path d="M15.171 13.576l1.474 1.474a1 1 0 001.414-1.414l-2.99-2.99a.999.999 0 00-.417-.118h-.001a1 1 0 00-.958.659 13.83 13.83 0 01-1.996 3.093 3.998 3.998 0 01-5.396-5.396 13.821 13.821 0 013.09-1.994 1 1 0 00.53-1.428 1 1 0 00-1.298-.36 15.821 15.821 0 00-3.493 2.268 6 6 0 008.067 8.067z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-2.5 border-2 border-teal-300 text-teal-900 font-medium rounded-lg hover:bg-teal-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || !oldPassword || !newPassword || !reEnterPassword}
                  className="flex-1 px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
