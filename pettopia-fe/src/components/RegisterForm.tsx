'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createUser } from '@/services/userService';
import Image from 'next/image';
import axios from 'axios';

type FormData = {
  fullname: string;
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  password: string;
  city: string;
  district: string;
  ward: string;
  street: string;
};

type Province = { code: string; name: string };
type District = { code: string; name: string; province_code: string };
type Ward = { code: string; name: string; district_code: string };

export default function RegisterForm() {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const router = useRouter();

  const selectedCity = watch('city');
  const selectedDistrict = watch('district');
  const selectedWard = watch('ward');

  // Fetch provinces (cities)
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts based on selected city
  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/p/${selectedCity}?depth=2`);
          setDistricts(response.data.districts);
          setValue('district', '');
          setValue('ward', '');
          setWards([]);
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    }
  }, [selectedCity, setValue]);

  // Fetch wards based on selected district
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
          setWards(response.data.wards);
          setValue('ward', '');
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const formattedData = {
        fullname: data.fullname,
        username: data.username,
        email_address: data.email,
        phone_number: data.phone,
        gender: data.gender,
        dob: data.dob,
        password: data.password,
        address: {
          city: provinces.find(p => p.code === data.city)?.name || data.city,
          district: districts.find(d => d.code === data.district)?.name || data.district,
          ward: wards.find(w => w.code === data.ward)?.name || data.ward,
          street: data.street,
        },
      };
      await createUser(formattedData);
      alert('Registration successful!');
      router.push('/login');
    } catch (err) {
      setServerError('Error registering user');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Your Company"
          src="/sampleimg/logo.png"
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

          {/* DOB and Gender */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="dob" className="block text-sm/6 font-medium text-gray-900">
                Date of Birth
              </label>
              <div className="mt-2">
                <input
                  id="dob"
                  {...register('dob', { required: true })}
                  type="date"
                  className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="Date of Birth"
                />
                {errors.dob && <p className="text-sm text-red-400 mt-1">Date of Birth is required</p>}
              </div>
            </div>
            <div className="w-1/2">
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
          </div>

          {/* City and District */}
          <div className="flex space-x-4">
            {/* City */}
            <div className="w-1/2">
              <label htmlFor="city" className="block text-sm/6 font-medium text-gray-900">
                City
              </label>
              <div className="mt-2">
                <select
                  id="city"
                  {...register('city', { required: true })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 focus:outline-teal-300 sm:text-sm/6"
                >
                  <option value="">Select City</option>
                  {provinces.map(province => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="text-sm text-red-400 mt-1">City is required</p>}
              </div>
            </div>

            {/* District — chỉ hiện sau khi chọn City */}
            <div className={`w-1/2 ${!selectedCity ? 'hidden' : ''}`}>
              <label htmlFor="district" className="block text-sm/6 font-medium text-gray-900">
                District
              </label>
              <div className="mt-2">
                <select
                  id="district"
                  {...register('district', { required: true })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 focus:outline-teal-300 sm:text-sm/6"
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && <p className="text-sm text-red-400 mt-1">District is required</p>}
              </div>
            </div>
          </div>

          {/* Ward and Street */}
          <div className="flex space-x-4">
            {/* Ward — chỉ hiện sau khi chọn District */}
            <div className={`w-1/2 ${!selectedDistrict ? 'hidden' : ''}`}>
              <label htmlFor="ward" className="block text-sm/6 font-medium text-gray-900">
                Ward
              </label>
              <div className="mt-2">
                <select
                  id="ward"
                  {...register('ward', { required: true })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 focus:outline-teal-300 sm:text-sm/6"
                >
                  <option value="">Select Ward</option>
                  {wards.map(ward => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {errors.ward && <p className="text-sm text-red-400 mt-1">Ward is required</p>}
              </div>
            </div>

            {/* Street — chỉ hiện sau khi chọn Ward */}
            <div className={`w-1/2 ${!selectedWard ? 'hidden' : ''}`}>
              <label htmlFor="street" className="block text-sm/6 font-medium text-gray-900">
                Street Address
              </label>
              <div className="mt-2">
                <input
                  id="street"
                  {...register('street', { required: true })}
                  className="block w-full bg-white px-3 py-1.5 text-base text-gray-900 border-b border-gray-300 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="Street Address"
                />
                {errors.street && <p className="text-sm text-red-400 mt-1">Street Address is required</p>}
              </div>
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