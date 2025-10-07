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
          src="/logo.svg" // Same logo as login
          width={40}
          height={40}
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
          Register for an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && <p className="text-center text-sm text-red-400">{serverError}</p>}
          {/* Fullname and Username */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="fullname" className="block text-sm/6 font-medium text-gray-100">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="fullname"
                  {...register('fullname', { required: true })}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  placeholder="Full Name"
                />
                {errors.fullname && <p className="text-sm text-red-400 mt-1">Full Name is required</p>}
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-100">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  {...register('username', { required: true })}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  placeholder="Username"
                />
                {errors.username && <p className="text-sm text-red-400 mt-1">Username is required</p>}
              </div>
            </div>
          </div>

          {/* Email and Phone */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  type="email"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  placeholder="Email address"
                />
                {errors.email && <p className="text-sm text-red-400 mt-1">Valid email is required</p>}
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-100">
                Phone
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  {...register('phone', { required: true })}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  placeholder="Phone"
                />
                {errors.phone && <p className="text-sm text-red-400 mt-1">Phone is required</p>}
              </div>
            </div>
          </div>

          {/* Address and Age */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="address" className="block text-sm/6 font-medium text-gray-100">
                Address
              </label>
              <div className="mt-2">
                <input
                  id="address"
                  {...register('address', { required: true })}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  placeholder="Address"
                />
                {errors.address && <p className="text-sm text-red-400 mt-1">Address is required</p>}
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="age" className="block text-sm/6 font-medium text-gray-100">
                Age
              </label>
              <div className="mt-2">
                <input
                  id="age"
                  {...register('age', { required: true, min: 18 })}
                  type="number"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  placeholder="Age"
                />
                {errors.age && <p className="text-sm text-red-400 mt-1">Age is required (min 18)</p>}
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm/6 font-medium text-gray-100">
              Gender
            </label>
            <div className="mt-2">
              <select
                id="gender"
                {...register('gender', { required: true })}
                className="block w-full rounded-md bg-gray-900 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option value="" className="bg-gray-900">Select Gender</option>
                <option value="male" className="bg-gray-900">Male</option>
                <option value="female" className="bg-gray-900">Female</option>
                <option value="other" className="bg-gray-900">Other</option>
              </select>
              {errors.gender && <p className="text-sm text-red-400 mt-1">Gender is required</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                {...register('password', { required: true, minLength: 6 })}
                type="password"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                placeholder="Password"
              />
              {errors.password && <p className="text-sm text-red-400 mt-1">Password is required (min 6 characters)</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Register
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}