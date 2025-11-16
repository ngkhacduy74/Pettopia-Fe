"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createUser } from "@/services/auth/authService";
import Image from "next/image";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
  description: string;
};

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

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>();
  const [serverError, setServerError] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const selectedCity = watch("city");
  const selectedDistrict = watch("district");

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
      setServerError("Không thể tải danh sách tỉnh/thành phố. Sử dụng dữ liệu mặc định.");
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
          const data = await fetchWithRetry(`https://api.mysupership.vn/v1/partner/areas/district?province=${selectedCity}`);
          const processedDistricts = data.results.map((d: any) => ({
            code: String(d.code),
            name: d.name,
            province_code: String(d.province_code),
          }));
          const filteredFallback = fallbackDistricts.filter(d => d.province_code === selectedCity);
          setDistricts(processedDistricts.length > 0 ? processedDistricts : filteredFallback);
          setValue("district", "");
          setValue("ward", "");
          setWards([]);
        } catch (error) {
          setServerError("Không thể tải danh sách quận/huyện. Sử dụng dữ liệu mặc định.");
          const filteredFallback = fallbackDistricts.filter(d => d.province_code === selectedCity);
          setDistricts(filteredFallback);
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
          const data = await fetchWithRetry(`https://api.mysupership.vn/v1/partner/areas/commune?district=${selectedDistrict}`);
          const processedWards = data.results.map((w: any) => ({
            code: String(w.code),
            name: w.name,
            district_code: String(w.district_code),
          }));
          const filteredFallback = fallbackWards.filter(w => w.district_code === selectedDistrict);
          setWards(processedWards.length > 0 ? processedWards : filteredFallback);
          setValue("ward", "");
        } catch (error) {
          setServerError("Không thể tải danh sách phường/xã. Sử dụng dữ liệu mặc định.");
          const filteredFallback = fallbackWards.filter(w => w.district_code === selectedDistrict);
          setWards(filteredFallback);
          setApiError(true);
        } finally {
          setIsLoadingWards(false);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (data.password !== confirmPassword) {
        setPasswordError("Mật khẩu nhập lại không khớp.");
        return;
      }
      setPasswordError("");

      const cityCode = data.city;
      const districtCode = data.district;
      const wardCode = data.ward;

      if (!cityCode || !districtCode || !wardCode) {
        setServerError("Vui lòng chọn đầy đủ tỉnh, quận, phường!");
        return;
      }

      const province = provinces.find((p) => p.code === cityCode);
      const district = districts.find((d) => d.code === districtCode);
      const ward = wards.find((w) => w.code === wardCode);

      if (!province || !district || !ward) {
        setServerError("Địa chỉ không hợp lệ. Vui lòng chọn lại!");
        return;
      }

      const formattedData = {
        fullname: data.fullname,
        username: data.username,
        email_address: data.email,
        phone_number: data.phone,
        gender: data.gender,
        dob: data.dob,
        password: data.password,
        address: {
          city: province.name,
          district: district.name,
          ward: ward.name,
          description: data.description,
        },
      };

      await createUser(formattedData);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      console.error("Lỗi khi đăng ký:", err);
      setServerError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!");
    }
  };

  // Animation thành công
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-white">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="mb-4">
            <svg className="w-20 h-20 mx-auto text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h2>
          <img
            src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"
            alt="Success"
            className="w-48 h-32 object-cover rounded-xl mx-auto my-4"
          />
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
            Đang chuyển hướng đến đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 ">
      <div className="w-full max-w-3xl m-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mx-4">
          {/* Logo và tiêu đề */}
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-teal-50 rounded-full mb-3">
              <Image
                alt="Logo"
                src="/sampleimg/logo.png"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Tạo tài khoản mới
            </h2>
            <p className="text-gray-500 text-sm mt-1">Điền thông tin để đăng ký</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <span>{serverError}</span>
                  {apiError && (
                    <button
                      type="button"
                      onClick={fetchProvinces}
                      className="block mt-2 text-xs text-teal-500 hover:text-teal-600 underline"
                    >
                      Thử lại
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Họ tên & Tên đăng nhập */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  id="fullname"
                  {...register("fullname", { required: true })}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                  placeholder="Nhập họ và tên"
                />
                {errors.fullname && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng nhập họ và tên</p>}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  {...register("username", { required: true })}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                  placeholder="Nhập tên đăng nhập"
                />
                {errors.username && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng nhập tên đăng nhập</p>}
              </div>
            </div>

            {/* Email & Số điện thoại */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng nhập email hợp lệ</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  {...register("phone", { required: true })}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                  placeholder="0123456789"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng nhập số điện thoại</p>}
              </div>
            </div>

            {/* Ngày sinh & Giới tính */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <input
                  id="dob"
                  type="date"
                  {...register("dob", { required: true })}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                />
                {errors.dob && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng chọn ngày sinh</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  id="gender"
                  {...register("gender", { required: true })}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng chọn giới tính</p>}
              </div>
            </div>

            {/* Tỉnh/Thành & Quận/Huyện */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố
                </label>
                <select
                  id="city"
                  {...register("city", { required: true })}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                  disabled={isLoadingProvinces}
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
                {errors.city && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng chọn tỉnh/thành phố</p>}
              </div>

              {selectedCity && (
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện
                  </label>
                  <select
                    id="district"
                    {...register("district", { required: true })}
                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                    disabled={isLoadingDistricts}
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
                  {errors.district && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng chọn quận/huyện</p>}
                </div>
              )}
            </div>

            {/* Phường/Xã & Địa chỉ chi tiết */}
            {selectedDistrict && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã
                  </label>
                  <select
                    id="ward"
                    {...register("ward", { required: true })}
                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                    disabled={isLoadingWards}
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
                  {errors.ward && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng chọn phường/xã</p>}
                </div>

                {watch("ward") && (
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      id="description"
                      {...register("description", { required: true })}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                      placeholder="Số nhà, đường..."
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Vui lòng nhập địa chỉ chi tiết</p>}
                  </div>
                )}
              </div>
            )}

            {/* Mật khẩu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: true, minLength: 6 })}
                    className="block w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> Mật khẩu phải có ít nhất 6 ký tự</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>●</span> {passwordError}</p>}
              </div>
            </div>

            {/* Nút đăng ký */}
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
              disabled={
                isLoadingProvinces ||
                isLoadingDistricts ||
                isLoadingWards ||
                provinces.length === 0 ||
                (!!selectedCity && districts.length === 0) ||
                (!!selectedDistrict && wards.length === 0)
              }
            >
              Đăng ký
            </button>
          </div>

          {/* Đăng nhập */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <a href="/auth/login" className="font-semibold text-teal-500 hover:text-teal-600 transition-colors">
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}