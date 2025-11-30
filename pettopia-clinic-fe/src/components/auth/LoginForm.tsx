'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/auth/authService';
import { parseJwt } from '@/utils/jwt';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type FormData = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const response = await loginUser(data);

      if (!response || !response.status) {
        setServerError(response?.message || 'Đăng nhập thất bại');
        return;
      }

      if (response.token) {
        localStorage.setItem('authToken', response.token);
        document.cookie = `authToken=${response.token}; path=/; max-age=3600; Secure`;

        const decoded = parseJwt(response.token);
        let userRole: string[] = [];

        if (decoded && decoded.role) {
          if (Array.isArray(decoded.role)) {
            userRole = decoded.role.filter((role) => typeof role === 'string' && role);
          } else if (typeof decoded.role === 'string') {
            userRole = decoded.role.split(',').map((role) => role.trim()).filter((role) => role);
          }

          if (!userRole.length) {
            setServerError('Không tìm thấy vai trò hợp lệ');
            return;
          }

          const rolesJson = JSON.stringify(userRole);
          document.cookie = `userRole=${rolesJson}; path=/; max-age=3600; Secure`;
          localStorage.setItem('userRole', rolesJson);

          setIsSuccess(true);
          setTimeout(() => {
            if (userRole.includes('Admin')) {
              router.push('/admin/dashboard');
            } else if (userRole.includes('Staff')) {
              router.push('/staff/dashboard');
            } else if (userRole.includes('Clinic')) {
              router.push('/clinic/dashboard');
            } else if (userRole.includes('Vet')) {
              router.push('/vet/main');
            } else if (userRole.includes('User')) {
              router.push('/user/submit-vet-certificate');
            } else {
              setServerError('Không tìm thấy vai trò phù hợp để chuyển hướng');
            }
          }, 1500);
        } else {
          setServerError('Không thể lấy thông tin vai trò từ token');
        }
      } else {
        setServerError(response?.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Lỗi kết nối hoặc server không phản hồi';
      setServerError(errorMessage);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-white">
        <div className="bg-white rounded-2xl shadow-xl p-5 text-center max-w-md">
          <div className="mb-4">
            <svg className="w-20 h-20 mx-auto text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập thành công!</h2>
          <p className="text-gray-500 text-sm mb-6">Chào mừng bạn trở lại</p>
          <div
            style={{
              width: "180px",
              height: "90px",
              margin: "16px auto",
              backgroundImage: "url(./sampleimg/cat.gif)",
              backgroundSize: "cover",
              borderRadius: "12px",
            }}
          ></div>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
            Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="">
            <Image
          alt="Your Company"
          src="/sampleimg/logo.png"
          width={60}
          height={60}
          className="mx-auto w-auto"
        />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-500 text-sm">Đăng nhập với tư cách là bác sĩ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Error Alert */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{serverError}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2.5">
              Tên đăng nhập
            </label>
            <input
              id="username"
              {...register('username', { required: 'Tên đăng nhập là bắt buộc' })}
              type="text"
              placeholder="Nhập tên đăng nhập của bạn"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all text-sm"
            />
            {errors.username && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                Mật khẩu
              </label>
              <a href="/auth/forgot" className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                id="password"
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                })}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all text-sm"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1.5 text-gray-400 hover:text-teal-600 transition-colors flex-shrink-0"
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang xử lý...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <a
            href="https://pettopia-user.onrender.com/auth/register"
            className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}