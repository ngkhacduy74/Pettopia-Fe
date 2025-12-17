'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { loginUser } from '@/services/auth/authService';
import { parseJwt } from '@/utils/jwt';
import { PaymentService } from '@/services/payment/PaymentService';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type FormData = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check payment status from query params
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const status = searchParams?.get('status');
      const orderCode = searchParams?.get('orderCode');

      console.log('checkPaymentStatus - status:', status, 'orderCode:', orderCode);

      // Only proceed if both status and orderCode are present
      if (status && orderCode) {
        if (status === 'PAID') {
          try {
            console.log('Calling PaymentService.getPaymentStatus with orderCode:', orderCode);
            const paymentStatus = await PaymentService.getPaymentStatus(orderCode);
            console.log('Payment status:', paymentStatus);
            // Show success toast notification
            toast.success('Tài khoản đã được nâng cấp thành công, vui lòng đăng nhập lại để hệ thống tiến hành nâng cấp!', {
              duration: 8000,
              position: 'top-right',
            });
          } catch (err: any) {
            console.error('Payment status check failed - Full error:', err);
            console.error('Error message:', err?.message);
            console.error('Error response:', err?.response);
            // Optionally show error toast
            toast.error(`Lỗi kiểm tra thanh toán: ${err?.message || 'Không xác định'}`, {
              duration: 5000,
              position: 'top-right',
            });
          }
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

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
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const secureFlag = isSecure ? '; Secure' : '';
        document.cookie = `authToken=${encodeURIComponent(response.token)}; path=/; max-age=3600; SameSite=Lax${secureFlag}`;

        const decoded = parseJwt(response.token);
        let userRole: string[] = [];

        if (decoded && decoded.role) {
          const rawRole: any = decoded.role;
          if (Array.isArray(rawRole)) {
            userRole = rawRole.filter((role) => typeof role === 'string' && role);
          } else if (typeof rawRole === 'string') {
            try {
              const parsed = JSON.parse(rawRole);
              if (Array.isArray(parsed)) {
                userRole = parsed.filter((r) => typeof r === 'string' && r);
              } else {
                userRole = (rawRole as string).split(',').map((r: string) => r.trim()).filter(Boolean);
              }
            } catch {
              userRole = (rawRole as string).split(',').map((r: string) => r.trim()).filter(Boolean);
            }
          } else {
            userRole = [String(rawRole)];
          }

          if (!userRole.length) {
            setServerError('Không tìm thấy vai trò hợp lệ');
            return;
          }

          const primaryRole = userRole[0];
          document.cookie = `userRole=${encodeURIComponent(primaryRole)}; path=/; max-age=3600; SameSite=Lax${secureFlag}`;
          localStorage.setItem('userRole', JSON.stringify(userRole));

          setIsSuccess(true);
          setTimeout(() => {
            router.push('/user/home');
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

  // Animation thành công
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-white">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="mb-4">
            <svg className="w-20 h-20 mx-auto text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập thành công!</h2>
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
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="w-full max-w-md m-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mx-4">
          {/* Logo và tiêu đề */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-teal-50 rounded-full mb-4">
              <Image
                alt="Logo"
                src="/sampleimg/logo.png"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Đăng nhập
            </h2>
            <p className="text-gray-500 text-sm mt-2">Đăng nhập với tư cách người dùng</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{serverError}</span>
              </div>
            )}

            {/* Tên đăng nhập */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập hoặc Email
              </label>
              <input
                id="username"
                {...register('username', { required: true })}
                type="text"
                placeholder="Nhập tên đăng nhập hoặc email"
                className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span>●</span> Vui lòng nhập tên đăng nhập hoặc email
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  {...register('password', { required: true, minLength: 6 })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  className="block w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span>●</span> Mật khẩu phải có ít nhất 6 ký tự
                </p>
              )}
            </div>

            {/* Nút đăng nhập */}
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
            >
              Đăng nhập
            </button>
          </div>

          {/* Đăng ký */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a
                href="/auth/register"
                className="font-semibold text-teal-500 hover:text-teal-600 transition-colors"
              >
                Đăng ký ngay
              </a>
            </p>
          </div>

          {/* Quên mật khẩu */}
          <div className="mt-4 text-center">
            <a
               href="/auth/forgot"
              className="text-sm text-gray-500 hover:text-teal-500 transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quên mật khẩu?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}