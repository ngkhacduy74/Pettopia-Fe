'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers } from '@/services/userService';
import Image from 'next/image';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const users = await getUsers();
      // Assuming API uses username, not email; adjust if your API uses email
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        alert('Login successful!'); // Replace with real auth (e.g., JWT)
        router.push('/update-vet-ifnormation'); // Redirect to home
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Error logging in');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Your Company"
          src="/sampleimg/logo.png" // Replace with your logo in public/
          width={60}
          height={60}
          className="mx-auto h-25 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Sign in
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                placeholder='abc@gmail.com'
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
              />
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
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder='*******'
                autoComplete="current-password"
                className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
              />
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