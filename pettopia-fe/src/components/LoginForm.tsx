'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/userService';
import { parseJwt } from '@/utils/jwt'; // Giả sử jwt.ts nằm ở utils/jwt.ts, điều chỉnh path nếu cần
import Image from 'next/image';

type FormData = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await loginUser(data);
      if (response.status && response.token) {
        // Lưu token vào localStorage
        localStorage.setItem('authToken', response.token);

        // Giải mã token để lấy role
        const decoded = parseJwt(response.token);
        if (decoded && decoded.role) {
          localStorage.setItem('userRole', decoded.role);

          alert('Đăng nhập thành công!');

          // Chuyển hướng dựa trên role
          if (decoded.role === 'Admin') {
            router.push('/user/home');
          } else if (decoded.role === 'User') {
            router.push('/user/home');
          } else if (decoded.role === 'Staff') {
            router.push('/user/home');
          } else if (decoded.role === 'Clinic') {
            router.push('/user/home');
          } else if (decoded.role === 'Vet') {
            router.push('/user/home');
          } else {
            setServerError('Vai trò không hợp lệ');
          }
        } else {
          setServerError('Không thể lấy thông tin vai trò từ token');
        }
      } else {
        setServerError('Đăng nhập thất bại');
      }
    } catch (err) {
      setServerError('Thông tin đăng nhập không hợp lệ hoặc lỗi server');
    }
  };

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
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Đăng nhập
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && <p className="text-center text-sm text-red-400">{serverError}</p>}
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
              Tên đăng nhập
            </label>
            <div className="mt-2">
              <input
                id="username"
                {...register('username', { required: true })}
                type="text"
                placeholder="Tên đăng nhập"
                autoComplete="username"
                className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
              />
              {errors.username && <p className="text-sm text-red-400 mt-1">Tên đăng nhập là bắt buộc</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
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
                autoComplete="current-password"
                className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
              />
              {errors.password && <p className="text-sm text-red-400 mt-1">Mật khẩu là bắt buộc (tối thiểu 6 ký tự)</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-teal-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Chưa có tài khoản?{' '}
          <a href="/auth/register" className="font-semibold text-teal-500 hover:text-teal-300">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}