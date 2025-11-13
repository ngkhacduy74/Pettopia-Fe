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
      }, 1500);
    } catch (err: any) {
      console.error("Lỗi khi đăng ký:", err);
      setServerError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!");
    }
  };

  // Animation thành công
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">Đăng ký thành công!</h2>
        <div
          style={{
            width: "200px",
            height: "100px",
            margin: "20px auto",
            backgroundImage: "url(./sampleimg/cat.gif)",
            backgroundSize: "cover",
            borderRadius: "12px",
          }}
        ></div>
        <p className="text-gray-500 text-sm mt-3">Đang chuyển hướng đến đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Logo công ty"
          src="/sampleimg/logo.png"
          width={40}
          height={40}
          className="mx-auto h-25 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold text-teal-600">
          Đăng ký
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Các input giữ nguyên như cũ... */}
          {/* (Đoạn form giữ nguyên, chỉ thay phần onSubmit và thêm animation) */}

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-900">
                Họ và tên
              </label>
              <input
                id="fullname"
                {...register("fullname", { required: true })}
                className="block w-full border-b border-gray-300 px-3 py-1.5 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
                placeholder="Họ và tên"
              />
              {errors.fullname && <p className="text-sm text-red-400 mt-1">Vui lòng nhập họ và tên!</p>}
            </div>
            <div className="w-1/2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-900">
                Tên đăng nhập
              </label>
              <input
                id="username"
                {...register("username", { required: true })}
                className="block w-full border-b border-gray-300 px-3 py-1.5 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
                placeholder="Tên đăng nhập"
              />
              {errors.username && <p className="text-sm text-red-400 mt-1">Vui lòng nhập tên đăng nhập!</p>}
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Địa chỉ email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                className="block w-full border-b border-gray-300 px-3 py-1.5 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
                placeholder="Địa chỉ email"
              />
              {errors.email && <p className="text-sm text-red-400 mt-1">Vui lòng nhập email hợp lệ!</p>}
            </div>
            <div className="w-1/2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                Số điện thoại
              </label>
              <input
                id="phone"
                {...register("phone", { required: true })}
                className="block w-full border-b border-gray-300 px-3 py-1.5 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
                placeholder="Số điện thoại"
              />
              {errors.phone && <p className="text-sm text-red-400 mt-1">Vui lòng nhập số điện thoại!</p>}
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="dob" className="block text-sm font-medium text-gray-900">
                Ngày sinh
              </label>
              <input
                id="dob"
                type="date"
                {...register("dob", { required: true })}
                className="block w-full border-b border-gray-300 px-3 py-1.5 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
              />
              {errors.dob && <p className="text-sm text-red-400 mt-1">Vui lòng chọn ngày sinh!</p>}
            </div>
            <div className="w-1/2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-900">
                Giới tính
              </label>
              <select
                id="gender"
                {...register("gender", { required: true })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 border border-gray-300 focus:border-teal-400 sm:text-sm"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              {errors.gender && <p className="text-sm text-red-400 mt-1">Vui lòng chọn giới tính!</p>}
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-900">
                Tỉnh/Thành phố
              </label>
              <select
                id="city"
                {...register("city", { required: true })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 focus:outline-teal-300 sm:text-sm/6"
                disabled={isLoadingProvinces}
              >
                <option value="">
                  {isLoadingProvinces
                    ? "Đang tải tỉnh/thành..."
                    : provinces.length === 0
                    ? "Không có dữ liệu"
                    : "Chọn Tỉnh/Thành phố"}
                </option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              {errors.city && <p className="text-sm text-red-400 mt-1">Vui lòng chọn tỉnh/thành phố!</p>}
            </div>

            {selectedCity && (
              <div className="w-1/2">
                <label htmlFor="district" className="block text-sm font-medium text-gray-900">
                  Quận/Huyện
                </label>
                <select
                  id="district"
                  {...register("district", { required: true })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 focus:outline-teal-300 sm:text-sm/6"
                  disabled={isLoadingDistricts}
                >
                  <option value="">
                    {isLoadingDistricts
                      ? "Đang tải quận/huyện..."
                      : districts.length === 0
                      ? "Không có dữ liệu"
                      : "Chọn Quận/Huyện"}
                  </option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && <p className="text-sm text-red-400 mt-1">Vui lòng chọn quận/huyện!</p>}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            {selectedDistrict && (
              <div className="w-1/2">
                <label htmlFor="ward" className="block text-sm font-medium text-gray-900">
                  Phường/Xã
                </label>
                <select
                  id="ward"
                  {...register("ward", { required: true })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 focus:outline-teal-300 sm:text-sm/6"
                  disabled={isLoadingWards}
                >
                  <option value="">
                    {isLoadingWards
                      ? "Đang tải phường/xã..."
                      : wards.length === 0
                      ? "Không có dữ liệu"
                      : "Chọn Phường/Xã"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {errors.ward && <p className="text-sm text-red-400 mt-1">Vui lòng chọn phường/xã!</p>}
              </div>
            )}

            {watch("ward") && (
              <div className="w-1/2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                  Địa chỉ chi tiết
                </label>
                <input
                  id="description"
                  {...register("description", { required: true })}
                  className="block w-full border-b border-gray-300 px-3 py-1.5 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
                  placeholder="Số nhà, đường..."
                />
                {errors.description && <p className="text-sm text-red-400 mt-1">Vui lòng nhập địa chỉ chi tiết!</p>}
              </div>
            )}
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", { required: true, minLength: 6 })}
                className="block w-full border-b border-gray-300 px-3 py-1.5 pr-10 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
                placeholder="*******"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-500"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="mt-4 relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full border-b border-gray-300 px-3 py-1.5 pr-10 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-500"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            {errors.password && (
              <p className="text-sm text-red-400 mt-1">Mật khẩu phải có ít nhất 6 ký tự, 1 số, 1 chữ cái và 1 ký tự đặc biệt!</p>
            )}
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:bg-gray-300"
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
        </form>

        <p className="mt-10 text-center text-sm text-gray-400">
          Đã có tài khoản?{" "}
          <a href="/auth/login" className="font-semibold text-teal-500 hover:text-teal-300">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}