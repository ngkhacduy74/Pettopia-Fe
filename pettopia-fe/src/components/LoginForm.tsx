'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/userService';
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
      await loginUser(data);
      alert('Login successful!');
      router.push('/update-vet-information'); // Corrected typo in path
    } catch (err) {
      setServerError('Invalid credentials or server error');
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
          Sign in
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && <p className="text-center text-sm text-red-400">{serverError}</p>}
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                {...register('username', { required: true })}
                type="text"
                placeholder="Username"
                autoComplete="username"
                className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
              />
              {errors.username && <p className="text-sm text-red-400 mt-1">Username is required</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-teal-500 hover:text-teal-300">
                  Forgot password?
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
              {errors.password && <p className="text-sm text-red-400 mt-1">Password is required (min 6 characters)</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-teal-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Not a member?{' '}
          <a href="/register" className="font-semibold text-teal-500 hover:text-teal-300">
            Register now
          </a>
        </p>
      </div>
    </div>
  );
}