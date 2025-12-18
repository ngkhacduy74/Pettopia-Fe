'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDownIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { parseJwt, isTokenExpired } from '@/utils/jwt';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { registerClinic } from '@/services/partner/clinicService';

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

type Province = { code: string; name: string };
type District = { code: string; name: string; province_code: string };
type Ward = { code: string; name: string; district_code: string };

// Fallback data - code là string, đúng định dạng mysupership
const fallbackProvinces: Province[] = [
  { code: "01", name: "Thành phố Hà Nội" },
  { code: "79", name: "Thành phố Hồ Chí Minh" },
];

const fallbackDistricts: District[] = [
  { code: "001", name: "Quận Ba Đình", province_code: "01" },
  { code: "760", name: "Quận 1", province_code: "79" },
];

const fallbackWards: Ward[] = [
  { code: "00001", name: "Phường Phúc Xá", district_code: "001" },
  { code: "26734", name: "Phường Bến Nghé", district_code: "760" },
];

export default function ClinicCreateForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ClinicFormData>({
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
  const { showSuccess, showError } = useToast();

  const selectedCity = watch('city');
  const selectedDistrict = watch('district');

  // === FETCH WITH RETRY (giống RegisterForm) ===
  const fetchWithRetry = async (url: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        if (i === retries - 1) {
          console.error(`Không thể tải từ ${url} sau ${retries} lần thử:`, error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // === FETCH PROVINCES ===
  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    setApiError(false);
    try {
      const data = await fetchWithRetry("https://api.mysupership.vn/v1/partner/areas/province");
      const processed = data.results.map((p: any) => ({
        code: String(p.code).padStart(2, '0'), // "1" → "01"
        name: p.name,
      }));
      setProvinces(processed.length > 0 ? processed : fallbackProvinces);
    } catch (error) {
      setServerError('Không thể tải tỉnh/thành phố. Dùng dữ liệu mặc định.');
      setProvinces(fallbackProvinces);
      setApiError(true);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  // === FETCH DISTRICTS ===
  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        setIsLoadingDistricts(true);
        setApiError(false);
        try {
          const data = await fetchWithRetry(`https://api.mysupership.vn/v1/partner/areas/district?province=${selectedCity}`);
          const processed = data.results.map((d: any) => ({
            code: String(d.code).padStart(3, '0'), // "1" → "001"
            name: d.name,
            province_code: String(d.province_code).padStart(2, '0'),
          }));
          const fallback = fallbackDistricts.filter(d => d.province_code === selectedCity);
          setDistricts(processed.length > 0 ? processed : fallback);
          setValue('district', '');
          setValue('ward', '');
          setWards([]);
        } catch (error) {
          setServerError('Không thể tải quận/huyện. Dùng dữ liệu mặc định.');
          const fallback = fallbackDistricts.filter(d => d.province_code === selectedCity);
          setDistricts(fallback);
          setApiError(true);
        } finally {
          setIsLoadingDistricts(false);
        }
      };
      fetchDistricts();
    }
  }, [selectedCity, setValue]);

  // === FETCH WARDS ===
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        setIsLoadingWards(true);
        setApiError(false);
        try {
          const data = await fetchWithRetry(`https://api.mysupership.vn/v1/partner/areas/commune?district=${selectedDistrict}`);
          const processed = data.results.map((w: any) => ({
            code: String(w.code).padStart(5, '0'), // "1" → "00001"
            name: w.name,
            district_code: String(w.district_code).padStart(3, '0'),
          }));
          const fallback = fallbackWards.filter(w => w.district_code === selectedDistrict);
          setWards(processed.length > 0 ? processed : fallback);
          setValue('ward', '');
        } catch (error) {
          setServerError('Không thể tải phường/xã. Dùng dữ liệu mặc định.');
          const fallback = fallbackWards.filter(w => w.district_code === selectedDistrict);
          setWards(fallback);
          setApiError(true);
        } finally {
          setIsLoadingWards(false);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict, setValue]);

  // === SUBMIT ===
  const onSubmit = async (data: ClinicFormData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || isTokenExpired(token)) {
        setServerError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        router.push('/auth/login');
        return;
      }

      const decoded = parseJwt(token);
      if (!decoded?.id) {
        setServerError('Token không hợp lệ.');
        router.push('/auth/login');
        return;
      }

      const province = provinces.find(p => p.code === data.city);
      const district = districts.find(d => d.code === data.district);
      const ward = wards.find(w => w.code === data.ward);

      if (!province || !district || !ward) {
        setServerError('Vui lòng chọn đầy đủ địa chỉ hợp lệ.');
        return;
      }

      const formattedData = {
        user_id: decoded.id,
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
          responsible_licenses: data.responsible_licenses.split(',').map(s => s.trim()).filter(Boolean),
          license_issued_date: data.license_issued_date || '',
        },
      };

      await registerClinic(formattedData);
      showSuccess('Đăng ký phòng khám thành công!', 5000);
      router.push('/user/waitting');
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-1">
  
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
          <span>{serverError}</span>
          {apiError && (
            <button type="button" onClick={fetchProvinces} className="underline hover:text-red-900 font-medium">
              Thử lại
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clinic Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng khám</label>
          <input
            {...register('clinic_name', {
              required: 'Vui lòng nhập tên phòng khám',
              minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
            })}
            placeholder="PetCare Clinic"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
          />
          {errors.clinic_name && <p className="mt-1 text-xs text-red-600">{errors.clinic_name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email_address', {
              required: 'Vui lòng nhập email',
              pattern: { value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, message: 'Email không hợp lệ' },
            })}
            type="email"
            placeholder="clinic@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.email_address && <p className="mt-1 text-xs text-red-600">{errors.email_address.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input
            {...register('phone_number', {
              required: 'Vui lòng nhập số điện thoại',
              pattern: { value: /^(?:\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, message: 'Số điện thoại không hợp lệ' },
            })}
            placeholder="+84901234567"
            className="w-full px-3 py-2 border border-gray-300 rounded-md  focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.phone_number && <p className="mt-1 text-xs text-red-600">{errors.phone_number.message}</p>}
        </div>

        {/* License Number - Mongoose Schema */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số giấy phép</label>
          <input
            {...register('license_number', {
              required: 'Vui lòng nhập số giấy phép',
              pattern: {
                value: /^([0-9]{10}|[0-9]{3,6}\/[A-Z]{2,6}(-[A-Z]{2,10})?)$/,
                message: 'Không hợp lệ (10 số hoặc 123/HNY-SNNPTNT)',
              },
              setValueAs: v => v.toUpperCase().trim(),
            })}
            placeholder="1234567890 hoặc 123/HNY"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
          />
          {errors.license_number && <p className="mt-1 text-xs text-red-600">{errors.license_number.message}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
          <div className="relative">
            <select
              {...register('city', { required: 'Vui lòng chọn tỉnh/thành phố' })}
              disabled={isLoadingProvinces}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 appearance-none"
            >
              <option value="">
                {isLoadingProvinces ? 'Đang tải...' : provinces.length === 0 ? 'Không có dữ liệu' : 'Chọn tỉnh/thành phố'}
              </option>
              {provinces.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
        </div>

        {/* District */}
        {selectedCity && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
            <div className="relative">
              <select
                {...register('district', { required: 'Vui lòng chọn quận/huyện' })}
                disabled={isLoadingDistricts || districts.length === 0}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 appearance-none"
              >
                <option value="">
                  {isLoadingDistricts ? 'Đang tải...' : districts.length === 0 ? 'Không có dữ liệu' : 'Chọn quận/huyện'}
                </option>
                {districts.map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district.message}</p>}
          </div>
        )}

        {/* Ward */}
        {selectedDistrict && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
            <div className="relative">
              <select
                {...register('ward', { required: 'Vui lòng chọn phường/xã' })}
                disabled={isLoadingWards || wards.length === 0}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 appearance-none"
              >
                <option value="">
                  {isLoadingWards ? 'Đang tải...' : wards.length === 0 ? 'Không có dữ liệu' : 'Chọn phường/xã'}
                </option>
                {wards.map(w => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.ward && <p className="mt-1 text-xs text-red-600">{errors.ward.message}</p>}
          </div>
        )}

        {/* Address Detail */}
        {selectedDistrict && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
            <input
              {...register('address_detail', { required: 'Vui lòng nhập địa chỉ chi tiết' })}
              placeholder="Số nhà, đường..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
            {errors.address_detail && <p className="mt-1 text-xs text-red-600">{errors.address_detail.message}</p>}
          </div>
        )}

        {/* Representative Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên người đại diện</label>
          <input
            {...register('representative_name', {
              required: 'Vui lòng nhập tên người đại diện',
              pattern: { value: /^[A-Za-zÀ-ỹ\s]+$/, message: 'Chỉ chữ cái và khoảng trắng' },
            })}
            placeholder="Nguyễn Văn A"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.representative_name && <p className="mt-1 text-xs text-red-600">{errors.representative_name.message}</p>}
        </div>

        {/* Identify Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số CMND/CCCD</label>
          <input
            {...register('identify_number', {
              required: 'Vui lòng nhập số CMND/CCCD',
              pattern: { value: /^[0-9]{9,12}$/, message: '9-12 chữ số' },
            })}
            placeholder="012345678901"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono"
          />
          {errors.identify_number && <p className="mt-1 text-xs text-red-600">{errors.identify_number.message}</p>}
        </div>

        {/* Responsible Licenses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giấy phép hành nghề (cách nhau bởi dấu phẩy)</label>
          <input
            {...register('responsible_licenses', {
              required: 'Vui lòng nhập ít nhất 1 giấy phép',
              validate: v => v.split(',').map(s => s.trim()).filter(Boolean).length > 0 || 'Phải có ít nhất 1 giấy phép',
            })}
            placeholder="1234, 5678"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.responsible_licenses && <p className="mt-1 text-xs text-red-600">{errors.responsible_licenses.message}</p>}
        </div>

        {/* License Issued Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp giấy phép (tùy chọn)</label>
          <input
            {...register('license_issued_date', {
              validate: v => !v || new Date(v) <= new Date() || 'Không được chọn ngày tương lai',
            })}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.license_issued_date && <p className="mt-1 text-xs text-red-600">{errors.license_issued_date.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={Object.keys(errors).length > 0 || isLoadingProvinces || isLoadingDistricts || isLoadingWards}
          className="px-8 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-sm"
        >
          Lưu thông tin
        </button>
      </div>
    </form>
  );
}