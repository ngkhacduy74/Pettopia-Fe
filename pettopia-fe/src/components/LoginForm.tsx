'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/auth/authService';
import { parseJwt } from '@/utils/jwt';
import Image from 'next/image';

type FormData = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const response = await loginUser(data);

      // ✅ Bắt lỗi dựa trên response.message
      if (!response || !response.status) {
        setServerError(response?.message || 'Đăng nhập thất bại');
        return;
      }

      if (response.token) {
        // Lưu token vào localStorage và cookie (an toàn với môi trường dev)
        localStorage.setItem('authToken', response.token);
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const secureFlag = isSecure ? '; Secure' : '';
        document.cookie = `authToken=${encodeURIComponent(response.token)}; path=/; max-age=3600; SameSite=Lax${secureFlag}`;

        // Giải mã token để lấy role
        const decoded = parseJwt(response.token);
        let userRole: string[] = [];

        if (decoded && decoded.role) {
          const rawRole: any = decoded.role;
          if (Array.isArray(rawRole)) {
            userRole = rawRole.filter((role) => typeof role === 'string' && role);
          } else if (typeof rawRole === 'string') {
            // rawRole có thể là JSON-stringified array hoặc chuỗi phân cách bằng dấu phẩy
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
            // chuyển đổi bất kỳ giá trị khác thành chuỗi
            userRole = [String(rawRole)];
          }

          if (!userRole.length) {
            setServerError('Không tìm thấy vai trò hợp lệ');
            return;
          }

          // Lưu một cookie userRole đơn (primary role) để middleware server có thể đọc dễ dàng
          const primaryRole = userRole[0];
          document.cookie = `userRole=${encodeURIComponent(primaryRole)}; path=/; max-age=3600; SameSite=Lax${secureFlag}`;

          // Vẫn lưu mảng roles vào localStorage cho UI nếu cần
          const rolesJson = JSON.stringify(userRole);
          localStorage.setItem('userRole', rolesJson);

          // ✅ Hiện animation thành công
          setIsSuccess(true);

          // ✅ Sau 2 giây chuyển hướng
          setTimeout(() => {
            const target = '/user/home';
            router.push(target);
          }, 1500);
        } else {
          setServerError('Không thể lấy thông tin vai trò từ token');
        }
      } else {
        setServerError(response?.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      // ✅ Nếu backend trả về lỗi dạng { message: '...' }
      const errorMessage = err?.response?.data?.message || 'Lỗi kết nối hoặc server không phản hồi';
      setServerError(errorMessage);
    }
  };

  // ✅ Nếu đăng nhập thành công → hiển thị animation mèo
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">Đăng nhập thành công!</h2>
        <div style={{ width: "200px", height: "100px", margin: "20px auto", backgroundImage: "url(./sampleimg/cat.gif)", backgroundSize: "cover", borderRadius: "12px", }} ></div>
        <p className="text-gray-500 text-sm mt-3">Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Your Company"
          src="/sampleimg/logo.png"
          width={60}
          height={60}
          className="mx-auto h-25 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Đăng nhập
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <p className="text-center text-sm text-red-500">{serverError}</p>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900">
              Tên đăng nhập
            </label>
            <div className="mt-2">
              <input
                id="username"
                {...register('username', { required: true })}
                type="text"
                placeholder="Tên đăng nhập"
                className="block w-full bg-white px-3 py-1.5 border-b border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-teal-600 focus:outline-none sm:text-sm"
              />
              {errors.username && (
                <p className="text-sm text-red-400 mt-1">Tên đăng nhập là bắt buộc</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Mật khẩu
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-teal-500 hover:text-teal-300">
                  Quên mật khẩu?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                {...register('password', { required: true, minLength: 6 })}
                type="password"
                placeholder="*******"
                className="block w-full bg-white px-3 py-1.5 border-b border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-teal-600 focus:outline-none sm:text-sm"
              />
              {errors.password && (
                <p className="text-sm text-red-400 mt-1">
                  Mật khẩu là bắt buộc (tối thiểu 6 ký tự)
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-400">
          Chưa có tài khoản?{' '}
          <a
            href="http://localhost:4001/auth/register"
            className="font-semibold text-teal-500 hover:text-teal-300"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
