'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createUser } from '@/services/userService';
import Image from 'next/image';

type FormData = {
  fullname: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  age: number;
  password: string;
};

export default function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      await createUser(data);
      alert('Registration successful!');
      router.push('/login'); // Redirect to login
    } catch (err) {
      setServerError('Error registering user');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Your Company"
          src="/sampleimg/logo.png" // Same logo as login
          width={40}
          height={40}
          className="mx-auto h-25 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Register
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && <p className="text-center text-sm text-red-400">{serverError}</p>}
          {/* Fullname and Username */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="fullname" className="block text-sm/6 font-medium text-gray-900">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="fullname"
                  {...register('fullname', { required: true })}
                  className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="Full Name"
                />
                {errors.fullname && <p className="text-sm text-red-400 mt-1">Full Name is required</p>}
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  {...register('username', { required: true })}
                  className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="Username"
                />
                {errors.username && <p className="text-sm text-red-400 mt-1">Username is required</p>}
              </div>
            </div>
          </div>

          {/* Email and Phone */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  type="email"
                  className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="Email address"
                />
                {errors.email && <p className="text-sm text-red-400 mt-1">Valid email is required</p>}
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-900">
                Phone
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  {...register('phone', { required: true })}
                  className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="Phone"
                />
                {errors.phone && <p className="text-sm text-red-400 mt-1">Phone is required</p>}
              </div>
            </div>
          </div>

          {/* Address and Age */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="address" className="block text-sm/6 font-medium text-gray-900">
                Address
              </label>
              <div className="mt-2">
                <input
                  id="address"
                  {...register('address', { required: true })}
                  className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="Address"
                />
                {errors.address && <p className="text-sm text-red-400 mt-1">Address is required</p>}
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="age" className="block text-sm/6 font-medium text-gray-900">
                Age
              </label>
              <div className="mt-2">
                <input
                  id="age"
                  {...register('age', { required: true, min: 18 })}
                  type="number"
                  className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="Age"
                />
                {errors.age && <p className="text-sm text-red-400 mt-1">Age is required (min 18)</p>}
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm/6 font-medium text-gray-900">
              Gender
            </label>
            <div className="mt-2">
              <select
                id="gender"
                {...register('gender', { required: true })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-200 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-300 sm:text-sm/6"
              >
                <option value="" className="bg-white">Select Gender</option>
                <option value="male" className="bg-white">Male</option>
                <option value="female" className="bg-white">Female</option>
                <option value="other" className="bg-white">Other</option>
              </select>
              {errors.gender && <p className="text-sm text-red-400 mt-1">Gender is required</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                {...register('password', { required: true, minLength: 6 })}
                type="password"
                className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                placeholder="Password"
              />
              {errors.password && <p className="text-sm text-red-400 mt-1">Password is required (min 6 characters)</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-teal-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              Register
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-teal-500 hover:text-teal-300">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}