'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import axios from 'axios';
import { parseJwt, isTokenExpired } from '../utils/jwt';
import { useRouter } from 'next/navigation';
import { registerClinic } from '../services/partner/clinicService';

interface ClinicFormData {
  clinic_name: string;
  email_address: string;
  phone_number: string;
  license_number: string;
  city: string;
  district: string;
  ward: string;
  address_detail: string;
  representative_name: string;
  identify_number: string;
  responsible_licenses: string;
  license_issued_date: string;
}

type Province = { code: number; name: string };
type District = { code: number; name: string; province_code: number };
type Ward = { code: number; name: string; district_code: number };

const fallbackProvinces: Province[] = [
  { code: 1, name: "Thành phố Hà Nội" },
  { code: 79, name: "Thành phố Hồ Chí Minh" },
];

const fallbackDistricts: District[] = [
  { code: 1, name: "Quận Ba Đình", province_code: 1 },
  { code: 760, name: "Quận 1", province_code: 79 },
];

const fallbackWards: Ward[] = [
  { code: 1, name: "Phường Phúc Xá", district_code: 1 },
  { code: 26734, name: "Phường Bến Nghé", district_code: 760 },
];

export default function ClinicCreateForm() {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ClinicFormData>({
    defaultValues: {
      clinic_name: '',
      email_address: '',
      phone_number: '',
      license_number: '',
      city: '',
      district: '',
      ward: '',
      address_detail: '',
      representative_name: '',
      identify_number: '',
      responsible_licenses: '',
      license_issued_date: '',
    },
    mode: 'onChange',
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const selectedCity = watch('city');
  const selectedDistrict = watch('district');
  const selectedWard = watch('ward');

  useEffect(() => {
    console.log("Form state:", {
      errors,
      selectedCity,
      selectedDistrict,
      selectedWard,
      isLoadingProvinces,
      isLoadingDistricts,
      isLoadingWards,
      provincesLength: provinces.length,
      districtsLength: districts.length,
      wardsLength: wards.length,
    });
  }, [errors, selectedCity, selectedDistrict, selectedWard, isLoadingProvinces, isLoadingDistricts, isLoadingWards, provinces, districts, wards]);

  const fetchWithRetry = async (url: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        if (i === retries - 1) {
          console.error(`Failed to fetch data from ${url} after ${retries} attempts:`, error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    setApiError(false);
    try {
      const data = await fetchWithRetry('https://provinces.open-api.vn/api/p/');
      const processedData = data.map((p: any) => ({ ...p, code: Number(p.code) }));
      setProvinces(processedData && processedData.length > 0 ? processedData : fallbackProvinces);
    } catch (error) {
      setServerError('Không thể tải danh sách tỉnh/thành phố. Sử dụng dữ liệu mặc định.');
      setProvinces(fallbackProvinces);
      setApiError(true);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        setIsLoadingDistricts(true);
        setApiError(false);
        try {
          const data = await fetchWithRetry(`https://provinces.open-api.vn/api/p/${selectedCity}?depth=2`);
          const processedDistricts = (data.districts || []).map((d: any) => ({
            ...d,
            code: Number(d.code),
            province_code: Number(d.province_code),
          }));
          setDistricts(processedDistricts.length > 0 ? processedDistricts : fallbackDistricts.filter(d => d.province_code === Number(selectedCity)));
          setValue('district', '');
          setValue('ward', '');
          setWards([]);
        } catch (error) {
          setServerError('Không thể tải danh sách quận/huyện. Sử dụng dữ liệu mặc định.');
          setDistricts(fallbackDistricts.filter(d => d.province_code === Number(selectedCity)));
          setApiError(true);
        } finally {
          setIsLoadingDistricts(false);
        }
      };
      fetchDistricts();
    }
  }, [selectedCity, setValue]);

  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        setIsLoadingWards(true);
        setApiError(false);
        try {
          const data = await fetchWithRetry(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
          const processedWards = (data.wards || []).map((w: any) => ({
            ...w,
            code: Number(w.code),
            district_code: Number(w.district_code),
          }));
          setWards(processedWards.length > 0 ? processedWards : fallbackWards.filter(w => w.district_code === Number(selectedDistrict)));
          setValue('ward', '');
        } catch (error) {
          setServerError('Không thể tải danh sách phường/xã. Sử dụng dữ liệu mặc định.');
          setWards(fallbackWards.filter(w => w.district_code === Number(selectedDistrict)));
          setApiError(true);
        } finally {
          setIsLoadingWards(false);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict, setValue]);

  const onSubmit = async (data: ClinicFormData) => {
    console.log("Form submitted with data:", data);
    try {
      const token = localStorage.getItem('authToken');
      console.log("authToken:", token);
      if (!token || isTokenExpired(token)) {
        setServerError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        router.push('/auth/login');
        return;
      }

      const decoded = parseJwt(token);
      console.log("Decoded token:", decoded);
      if (!decoded) {
        setServerError('Không thể giải mã token. Vui lòng đăng nhập lại.');
        router.push('/auth/login');
        return;
      }

      const userId = decoded.id;
      console.log("userId:", userId);

      const province = provinces.find((p) => p.code === Number(data.city));
      const district = districts.find((d) => d.code === Number(data.district));
      const ward = wards.find((w) => w.code === Number(data.ward));
      console.log("Selected address:", { province, district, ward });

      if (!province || !district || !ward) {
        setServerError('Vui lòng chọn đầy đủ tỉnh/thành phố, quận/huyện và phường/xã hợp lệ.');
        return;
      }

      const formattedData = {
        user_id: userId,
        clinic_name: data.clinic_name,
        email: { email_address: data.email_address },
        phone: { phone_number: data.phone_number },
        license_number: data.license_number,
        address: {
          city: province.name,
          district: district.name,
          ward: ward.name,
          detail: data.address_detail,
        },
        representative: {
          name: data.representative_name,
          identify_number: data.identify_number,
          responsible_licenses: data.responsible_licenses.split(',').map(item => item.trim()),
          license_issued_date: data.license_issued_date,
        },
      };

      console.log('📋 Dữ liệu gửi đi:', formattedData);
      await registerClinic(formattedData);

      alert('Đăng ký phòng khám thành công!');
      router.push('/user/waitting');
    } catch (error: any) {
      console.error('Lỗi khi gửi dữ liệu:', error.response?.data || error.message);
      setServerError(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      <div className="pb-12">
        <h1 className="text-5xl leading-tight font-semibold text-black break-words text-teal-500">Clinic Profile</h1>
        <p className="mt-1 pt-4 text-sm/6 text-black">
          Fill in the details below to create your veterinarian profile.
        </p>

        {serverError && (
          <div className="text-center">
            <p className="text-sm text-red-400">{serverError}</p>
            {apiError && (
              <button
                type="button"
                onClick={fetchProvinces}
                className="mt-2 text-sm text-teal-500 hover:text-teal-300"
              >
                Thử lại
              </button>
            )}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="clinic_name" className="block text-sm/6 font-medium text-black">
              Clinic Name
            </label>
            <input
              id="clinic_name"
              {...register('clinic_name', {
                required: 'Vui lòng nhập tên phòng khám',
                minLength: { value: 3, message: 'Tên phòng khám phải có ít nhất 3 ký tự' },
                maxLength: { value: 100, message: 'Tên phòng khám không được vượt quá 100 ký tự' },
                pattern: {
                  value: /^[A-Za-zÀ-ỹ0-9\s'’().,-]+$/,
                  message: 'Tên phòng khám không hợp lệ',
                },
              })}
              type="text"
              placeholder="Ex: Phong Hai Clinic"
              className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
            />
            {errors.clinic_name && <p className="text-sm text-red-400 mt-1">{errors.clinic_name.message}</p>}
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="email_address" className="block text-sm/6 font-medium text-black">
              Email
            </label>
            <input
              id="email_address"
              {...register('email_address', {
                required: 'Vui lòng nhập email',
                pattern: {
                  value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: 'Email không hợp lệ',
                },
              })}
              type="email"
              placeholder="Ex: abc@gmail.com"
              className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
            />
            {errors.email_address && <p className="text-sm text-red-400 mt-1">{errors.email_address.message}</p>}
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="phone_number" className="block text-sm/6 font-medium text-black">
              Phone Number
            </label>
            <input
              id="phone_number"
              {...register('phone_number', {
                required: 'Vui lòng nhập số điện thoại',
                pattern: {
                  value: /^(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/,
                  message: 'Số điện thoại không hợp lệ (chỉ chấp nhận số Việt Nam)',
                },
              })}
              type="text"
              placeholder="Ex: +84901234567"
              className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
            />
            {errors.phone_number && <p className="text-sm text-red-400 mt-1">{errors.phone_number.message}</p>}
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="license_number" className="block text-sm/6 font-medium text-black">
              License Number
            </label>
            <input
              id="license_number"
              {...register('license_number', {
                required: 'Vui lòng nhập số giấy phép',
                pattern: {
                  value: /^[A-Z0-9\-]{6,20}$/,
                  message: 'Số giấy phép hành nghề không hợp lệ (6-20 ký tự, chỉ chữ cái in hoa và số)',
                },
                setValueAs: (value: string) => value.toUpperCase(),
              })}
              type="text"
              placeholder="Ex: ABC123"
              className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
            />
            {errors.license_number && <p className="text-sm text-red-400 mt-1">{errors.license_number.message}</p>}
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="city" className="block text-sm/6 font-medium text-black">
              City
            </label>
            <select
              id="city"
              {...register('city', { required: 'Vui lòng chọn tỉnh/thành phố' })}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black border border-teal-700 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
              disabled={isLoadingProvinces || provinces.length === 0}
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {isLoadingProvinces ? (
                <option value="">Đang tải...</option>
              ) : (
                provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))
              )}
            </select>
            {errors.city && <p className="text-sm text-red-400 mt-1">{errors.city.message}</p>}
          </div>

          {selectedCity && (
            <div className="sm:col-span-4">
              <label htmlFor="district" className="block text-sm/6 font-medium text-black">
                District
              </label>
              <select
                id="district"
                {...register('district', { required: 'Vui lòng chọn quận/huyện' })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black border border-teal-700 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                disabled={!selectedCity || isLoadingDistricts || districts.length === 0}
              >
                <option value="">Chọn Quận/Huyện</option>
                {isLoadingDistricts ? (
                  <option value="">Đang tải...</option>
                ) : (
                  districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))
                )}
              </select>
              {errors.district && <p className="text-sm text-red-400 mt-1">{errors.district.message}</p>}
            </div>
          )}

          {selectedDistrict && (
            <div className="sm:col-span-4">
              <label htmlFor="ward" className="block text-sm/6 font-medium text-black">
                Ward
              </label>
              <select
                id="ward"
                {...register('ward', { required: 'Vui lòng chọn phường/xã' })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black border border-teal-700 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                disabled={!selectedDistrict || isLoadingWards || wards.length === 0}
              >
                <option value="">Chọn Phường/Xã</option>
                {isLoadingWards ? (
                  <option value="">Đang tải...</option>
                ) : (
                  wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))
                )}
              </select>
              {errors.ward && <p className="text-sm text-red-400 mt-1">{errors.ward.message}</p>}
            </div>
          )}

          {selectedWard && (
            <div className="sm:col-span-4">
              <label htmlFor="address_detail" className="block text-sm/6 font-medium text-black">
                Address Detail
              </label>
              <input
                id="address_detail"
                {...register('address_detail', { required: 'Vui lòng nhập địa chỉ chi tiết' })}
                type="text"
                placeholder="Ex: 123 Xuan Thuy"
                className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
              />
              {errors.address_detail && <p className="text-sm text-red-400 mt-1">{errors.address_detail.message}</p>}
            </div>
          )}

          <div className="sm:col-span-4">
            <label htmlFor="representative_name" className="block text-sm/6 font-medium text-black">
              Representative Name
            </label>
            <input
              id="representative_name"
              {...register('representative_name', {
                required: 'Vui lòng nhập tên người đại diện',
                pattern: {
                  value: /^[A-Za-zÀ-ỹ\s]+$/,
                  message: 'Tên người đại diện không hợp lệ (chỉ chấp nhận chữ cái và khoảng trắng)',
                },
              })}
              type="text"
              placeholder="Ex: Nguyen Van A"
              className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
            />
            {errors.representative_name && <p className="text-sm text-red-400 mt-1">{errors.representative_name.message}</p>}
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="identify_number" className="block text-sm/6 font-medium text-black">
              Identify Number
            </label>
            <input
              id="identify_number"
              {...register('identify_number', {
                required: 'Vui lòng nhập số CMND/CCCD',
                pattern: {
                  value: /^[0-9]{9,12}$/,
                  message: 'Số CMND/CCCD không hợp lệ (9-12 chữ số)',
                },
              })}
              type="text"
              placeholder="Ex: 012345678901"
              className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
            />
            {errors.identify_number && <p className="text-sm text-red-400 mt-1">{errors.identify_number.message}</p>}
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="responsible_licenses" className="block text-sm/6 font-medium text-black">
              Responsible Licenses
            </label>
            <input
              id="responsible_licenses"
              {...register('responsible_licenses', {
                required: 'Vui lòng nhập số giấy phép chịu trách nhiệm',
                validate: {
                  nonEmptyArray: (value) =>
                    value.split(',').map(item => item.trim()).filter(item => item).length > 0 ||
                    'Phải có ít nhất một giấy phép hành nghề',
                },
              })}
              type="text"
              placeholder="Ex: 1234, 5678"
              className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
            />
            {errors.responsible_licenses && <p className="text-sm text-red-400 mt-1">{errors.responsible_licenses.message}</p>}
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="license_issued_date" className="block text-sm/6 font-medium text-black">
              License Issued Date
            </label>
            <input
              id="license_issued_date"
              {...register('license_issued_date', {
                required: false,
                validate: {
                  notFutureDate: (value) =>
                    !value || new Date(value) <= new Date() || 'Ngày cấp phép không được lớn hơn ngày hiện tại',
                },
              })}
              type="date"
              className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
            />
            {errors.license_issued_date && <p className="text-sm text-red-400 mt-1">{errors.license_issued_date.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <div className="w-full sm:w-2/3">
          <hr className="border-t border-teal-700 mb-6" />
          <div className="flex justify-end gap-x-6">
            <button
              type="button"
              className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-semibold text-white border border-teal-700 transition focus:outline-2 focus:outline-offset-2 focus:outline-teal-700"
              disabled={
                Boolean(errors.city) ||
                Boolean(errors.district) ||
                Boolean(errors.ward) ||
                Boolean(errors.address_detail) ||
                !Boolean(selectedCity) ||
                !Boolean(selectedDistrict) ||
                !Boolean(selectedWard) ||
                isLoadingProvinces ||
                isLoadingDistricts ||
                isLoadingWards ||
                provinces.length === 0 ||
                (Boolean(selectedCity) && districts.length === 0) ||
                (Boolean(selectedDistrict) && wards.length === 0)
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}