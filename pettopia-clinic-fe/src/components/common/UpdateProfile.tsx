'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCustomerProfile, updateCustomerProfile } from "@/services/user/userService";
import { Mail, MapPin, Calendar, Phone, Home, Clock, Edit3, ArrowLeft, Loader } from 'lucide-react';
import axios from "axios";

interface User {
  id: string;
  fullname: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  address?: {
    city?: string;
    district?: string;
    ward?: string;
    detail?: string;
    description?: string;
  };
  dob?: string;
  createdAt?: string;
}

interface FormData {
  fullname: string;
  email: string;
  phone: string;
  dob: string;
  address: {
    city: string;
    district: string;
    ward: string;
    detail: string;
  };
}

type Province = { code: string; name: string };
type District = { code: string; name: string; province_code: string };
type Ward = { code: string; name: string; district_code: string };

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

export default function EditProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const today = new Date().toISOString().split('T')[0];
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    email: '',
    phone: '',
    dob: '',
    address: {
      city: '',
      district: '',
      ward: '',
      detail: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Address API states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  // Selected address codes (for API lookup)
  const [selectedCityCode, setSelectedCityCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');

  // Helper function to format date from ISO string to YYYY-MM-DD
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      // If dateString is already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        return dateString.split('T')[0];
      }
      return '';
    }
  };

  const fetchWithRetry = async (url: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    setApiError(false);
    try {
      const data = await fetchWithRetry("https://api.mysupership.vn/v1/partner/areas/province");
      const processedData = data.results.map((p: any) => ({
        code: String(p.code),
        name: p.name,
      }));
      setProvinces(processedData.length > 0 ? processedData : fallbackProvinces);
    } catch (error) {
      setProvinces(fallbackProvinces);
      setApiError(true);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  // Find province code by name
  const findProvinceCodeByName = (name: string): string => {
    const province = provinces.find(p => p.name === name);
    return province?.code || '';
  };

  // Find district code by name and province code
  const findDistrictCodeByName = (name: string, provinceCode: string): string => {
    const district = districts.find(d => d.name === name && d.province_code === provinceCode);
    return district?.code || '';
  };

  // Find ward code by name and district code
  const findWardCodeByName = (name: string, districtCode: string): string => {
    const ward = wards.find(w => w.name === name && w.district_code === districtCode);
    return ward?.code || '';
  };

  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch districts when city is selected
  useEffect(() => {
    if (selectedCityCode) {
      const fetchDistricts = async () => {
        setIsLoadingDistricts(true);
        setApiError(false);
        try {
          const data = await fetchWithRetry(`https://api.mysupership.vn/v1/partner/areas/district?province=${selectedCityCode}`);
          const processedDistricts = data.results.map((d: any) => ({
            code: String(d.code),
            name: d.name,
            province_code: String(d.province_code),
          }));
          const filteredFallback = fallbackDistricts.filter((d: District) => d.province_code === selectedCityCode);
          setDistricts(processedDistricts.length > 0 ? processedDistricts : filteredFallback);
          setValue("district", "");
          setValue("ward", "");
          setWards([]);
        } catch (error) {
          const filteredFallback = fallbackDistricts.filter((d: District) => d.province_code === selectedCityCode);
          setDistricts(filteredFallback);
          setApiError(true);
        } finally {
          setIsLoadingDistricts(false);
        }
      };
      fetchDistricts();
    }
  }, [selectedCityCode]);

  // Fetch wards when district is selected
  useEffect(() => {
    if (selectedDistrictCode) {
      const fetchWards = async () => {
        setIsLoadingWards(true);
        setApiError(false);
        try {
          const data = await fetchWithRetry(`https://api.mysupership.vn/v1/partner/areas/commune?district=${selectedDistrictCode}`);
          const processedWards = data.results.map((w: any) => ({
            code: String(w.code),
            name: w.name,
            district_code: String(w.district_code),
          }));
          const filteredFallback = fallbackWards.filter((w: Ward) => w.district_code === selectedDistrictCode);
          setWards(processedWards.length > 0 ? processedWards : filteredFallback);
          setValue("ward", "");
        } catch (error) {
          const filteredFallback = fallbackWards.filter((w: Ward) => w.district_code === selectedDistrictCode);
          setWards(filteredFallback);
          setApiError(true);
        } finally {
          setIsLoadingWards(false);
        }
      };
      fetchWards();
    }
  }, [selectedDistrictCode]);

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const hasToken =
          typeof window !== "undefined" ? !!localStorage.getItem("authToken") : false;
        if (!hasToken) {
          setError('Vui lòng đăng nhập để xem trang này');
          router.push('/auth/login');
          return;
        }

        const data = await getCustomerProfile();
        if (!data) {
          setError('Không tìm thấy thông tin người dùng');
          return;
        }

        const mapped: User = {
          id: data.id || data._id || data.customer_id || '',
          fullname: data.fullname || data.username || 'Người dùng',
          username: data.username,
          email: typeof data.email === 'string' ? data.email : data.email?.email_address || '',
          phone: typeof data.phone === 'string' ? data.phone : data.phone?.phone_number || '',
          avatar_url: data.avatar_url || data.avatar || undefined,
          address: {
            city: data.address?.city || '',
            district: data.address?.district || '',
            ward: data.address?.ward || '',
            detail: data.address?.detail || data.address?.description || ''
          },
          dob: data.dob || '',
          createdAt: data.createdAt || data.created_at || ''
        };

        setUser(mapped);
        
        // Format date for input (from ISO string to YYYY-MM-DD)
        const formattedDob = formatDateForInput(mapped.dob);
        
        setFormData({
          fullname: mapped.fullname,
          email: mapped.email || '',
          phone: mapped.phone || '',
          dob: formattedDob,
          address: {
            city: mapped.address?.city ?? '',
            district: mapped.address?.district ?? '',
            ward: mapped.address?.ward ?? '',
            detail: mapped.address?.detail ?? mapped.address?.description ?? ''
          }
        });
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Note: Address mapping is now done only when user clicks "Chỉnh sửa địa chỉ"
  // This useEffect is removed to avoid unnecessary API calls

  const setValue = (field: string, value: string) => {
    if (field === 'district' || field === 'ward' || field === 'detail') {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityCode = e.target.value;
    setSelectedCityCode(cityCode);
    const selectedProvince = provinces.find(p => p.code === cityCode);
    setFormData(prev => ({
      ...prev,
      address: {
        city: selectedProvince?.name || '',
        district: '',
        ward: '',
        detail: prev.address.detail
      }
    }));
    setSelectedDistrictCode('');
    setDistricts([]);
    setWards([]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    setSelectedDistrictCode(districtCode);
    const selectedDistrict = districts.find(d => d.code === districtCode);
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        district: selectedDistrict?.name || '',
        ward: ''
      }
    }));
    setWards([]);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = e.target.value;
    const selectedWard = wards.find(w => w.code === wardCode);
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ward: selectedWard?.name || ''
      }
    }));
  };

  const handleAddressDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        detail: e.target.value
      }
    }));
  };

  const handleEditAddress = async () => {
    setIsEditingAddress(true);
    // Ensure provinces are loaded
    if (provinces.length === 0) {
      await fetchProvinces();
    }
    
    // Trigger address mapping when entering edit mode
    if (user?.address?.city) {
      const provinceList = provinces.length > 0 ? provinces : fallbackProvinces;
      const cityCode = provinceList.find(p => p.name === user.address?.city)?.code || '';
      if (cityCode) {
        setSelectedCityCode(cityCode);
        // Load districts for this city
        try {
          const districtData = await fetchWithRetry(`https://api.mysupership.vn/v1/partner/areas/district?province=${cityCode}`);
          const processedDistricts = districtData.results.map((d: any) => ({
            code: String(d.code),
            name: d.name,
            province_code: String(d.province_code),
          }));
          const filteredFallback = fallbackDistricts.filter((d: District) => d.province_code === cityCode);
          const districtList = processedDistricts.length > 0 ? processedDistricts : filteredFallback;
          setDistricts(districtList);
          
          // Find district code if user has district
          if (user.address?.district) {
            const districtCode = districtList.find((d: District) => d.name === user.address?.district)?.code || '';
            if (districtCode) {
              setSelectedDistrictCode(districtCode);
              
              // Load wards for this district
              try {
                const wardData = await fetchWithRetry(`https://api.mysupership.vn/v1/partner/areas/commune?district=${districtCode}`);
                const processedWards = wardData.results.map((w: any) => ({
                  code: String(w.code),
                  name: w.name,
                  district_code: String(w.district_code),
                }));
                const filteredWardFallback = fallbackWards.filter((w: Ward) => w.district_code === districtCode);
                setWards(processedWards.length > 0 ? processedWards : filteredWardFallback);
              } catch (error) {
                console.error('Error loading wards:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error loading districts:', error);
        }
      }
    }
  };

  const handleCancelEditAddress = () => {
    setIsEditingAddress(false);
    // Restore original address
    if (user) {
      setFormData(prev => ({
        ...prev,
        address: {
          city: user.address?.city || '',
          district: user.address?.district || '',
          ward: user.address?.ward || '',
          detail: user.address?.detail || user.address?.description || ''
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullname.trim()) {
      setError('Họ và tên không được để trống');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email không được để trống');
      return;
    }

    if (formData.dob) {
      const selectedDate = new Date(formData.dob);
      const now = new Date();
      if (selectedDate > now) {
        setError('Ngày sinh không được lớn hơn hiện tại');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const updateData: Record<string, any> = {
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone || undefined,
        dob: formData.dob || undefined
      };

      // Chỉ gửi address khi user đang chỉnh sửa địa chỉ
      if (isEditingAddress) {
        updateData.address = {
          city: formData.address.city || undefined,
          district: formData.address.district || undefined,
          ward: formData.address.ward || undefined,
          description: formData.address.detail || undefined
        };
      }

      const result = await updateCustomerProfile(updateData);
      
      if (result) {
        setSuccess('Cập nhật hồ sơ thành công!');
        
        // Determine profile path based on current route
        const getProfilePath = () => {
          if (pathname.includes('/admin/')) return '/admin/profile';
          if (pathname.includes('/staff/')) return '/staff/profile';
          if (pathname.includes('/clinic/')) return '/clinic/profile';
          if (pathname.includes('/vet/')) return '/vet/profile';
          return '/user/profile';
        };
        
        setTimeout(() => {
          router.push(getProfilePath());
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-5">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {error || "Không thể tải thông tin"}
          </h2>
          <Link href="/auth/login">
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Đăng nhập
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 ">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          
          {/* Full Name */}
          <div>
            <label htmlFor="fullname" className="block text-sm font-semibold text-gray-900 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-semibold text-gray-900 mb-2">
              Ngày sinh
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              max={today}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Address Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Địa chỉ</h3>
              {!isEditingAddress && (
                <button
                  type="button"
                  onClick={handleEditAddress}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa địa chỉ
                </button>
              )}
            </div>

            {!isEditingAddress ? (
              // Display mode - show current address
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Home className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 leading-relaxed">
                      {formData.address.city || formData.address.district || formData.address.ward || formData.address.detail ? (
                        <div>
                          {[formData.address.detail, formData.address.ward, formData.address.district, formData.address.city]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      ) : (
                        <span className="text-gray-400">Chưa cập nhật địa chỉ</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit mode - show dropdowns
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address-detail" className="block text-sm font-semibold text-gray-900 mb-2">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      id="address-detail"
                      value={formData.address.detail}
                      onChange={handleAddressDetailChange}
                      placeholder="Số nhà, tên đường..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      id="city"
                      value={selectedCityCode}
                      onChange={handleCityChange}
                      disabled={isLoadingProvinces}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                    >
                      <option value="">
                        {isLoadingProvinces ? "Đang tải..." : provinces.length === 0 ? "Không có dữ liệu" : "Chọn Tỉnh/Thành phố"}
                      </option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCityCode && (
                    <div>
                      <label htmlFor="district" className="block text-sm font-semibold text-gray-900 mb-2">
                        Quận/Huyện
                      </label>
                      <select
                        id="district"
                        value={selectedDistrictCode}
                        onChange={handleDistrictChange}
                        disabled={isLoadingDistricts}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        <option value="">
                          {isLoadingDistricts ? "Đang tải..." : districts.length === 0 ? "Không có dữ liệu" : "Chọn Quận/Huyện"}
                        </option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedDistrictCode && (
                    <div>
                      <label htmlFor="ward" className="block text-sm font-semibold text-gray-900 mb-2">
                        Phường/Xã
                      </label>
                      <select
                        id="ward"
                        value={wards.find(w => w.name === formData.address.ward)?.code || ''}
                        onChange={handleWardChange}
                        disabled={isLoadingWards}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        <option value="">
                          {isLoadingWards ? "Đang tải..." : wards.length === 0 ? "Không có dữ liệu" : "Chọn Phường/Xã"}
                        </option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEditAddress}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader className="w-4 h-4 animate-spin" />}
              {submitting ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}