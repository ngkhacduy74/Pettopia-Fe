"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createUser } from "@/services/auth/authService";
import Image from "next/image";
import axios from "axios";

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

type Province = { code: number; name: string };
type District = { code: number; name: string; province_code: number };
type Ward = { code: number; name: string; district_code: number };

// Fallback dữ liệu tĩnh nếu API thất bại (code là number)
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
  const router = useRouter();

  const selectedCity = watch("city");
  const selectedDistrict = watch("district");
  const selectedWard = watch("ward");

  // Fetch helper
  const fetchWithRetry = async (url: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        if (i === retries - 1) {
          console.error(`Không thể tải dữ liệu từ ${url} sau ${retries} lần thử:`, error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  // Load provinces
  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    setApiError(false);
    try {
      const data = await fetchWithRetry("https://provinces.open-api.vn/api/p/");
      // Đảm bảo code là number
      const processedData = data.map((p: any) => ({ ...p, code: Number(p.code) }));
      setProvinces(processedData && processedData.length > 0 ? processedData : fallbackProvinces);
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

  // Fetch districts when city selected
  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        setIsLoadingDistricts(true);
        setApiError(false);
        try {
          const data = await fetchWithRetry(`https://provinces.open-api.vn/api/p/${selectedCity}?depth=2`);
          // Đảm bảo code là number
          const processedDistricts = (data.districts || []).map((d: any) => ({
            ...d,
            code: Number(d.code),
            province_code: Number(d.province_code),
          }));
          setDistricts(processedDistricts.length > 0 ? processedDistricts : fallbackDistricts.filter(d => d.province_code === Number(selectedCity)));
          setValue("district", "");
          setValue("ward", "");
          setWards([]);
        } catch (error) {
          setServerError("Không thể tải danh sách quận/huyện. Sử dụng dữ liệu mặc định.");
          setDistricts(fallbackDistricts.filter(d => d.province_code === Number(selectedCity)));
          setApiError(true);
        } finally {
          setIsLoadingDistricts(false);
        }
      };
      fetchDistricts();
    }
  }, [selectedCity, setValue]);

  // Fetch wards when district selected
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        setIsLoadingWards(true);
        setApiError(false);
        try {
          const data = await fetchWithRetry(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
          // Đảm bảo code là number
          const processedWards = (data.wards || []).map((w: any) => ({
            ...w,
            code: Number(w.code),
            district_code: Number(w.district_code),
          }));
          setWards(processedWards.length > 0 ? processedWards : fallbackWards.filter(w => w.district_code === Number(selectedDistrict)));
          setValue("ward", "");
        } catch (error) {
          setServerError("Không thể tải danh sách phường/xã. Sử dụng dữ liệu mặc định.");
          setWards(fallbackWards.filter(w => w.district_code === Number(selectedDistrict)));
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
      // Log dữ liệu đầu vào để debug
      console.log("📋 Dữ liệu form:", data);

      // Chuyển đổi code từ string sang number
      const cityCode = Number(data.city);
      const districtCode = Number(data.district);
      const wardCode = Number(data.ward);

      // Kiểm tra nếu code không hợp lệ (NaN)
      if (isNaN(cityCode) || isNaN(districtCode) || isNaN(wardCode)) {
        setServerError("Giá trị địa chỉ không hợp lệ. Vui lòng chọn lại.");
        return;
      }

      // Tìm tên chính xác từ code
      const province = provinces.find((p) => p.code === cityCode);
      const district = districts.find((d) => d.code === districtCode);
      const ward = wards.find((w) => w.code === wardCode);

      // Sử dụng tên thay vì code
      const cityName = province?.name || "";
      const districtName = district?.name || "";
      const wardName = ward?.name || "";

      // Kiểm tra dữ liệu hợp lệ
      if (!cityName) {
        setServerError("Vui lòng chọn tỉnh/thành phố hợp lệ.");
        console.warn("Không tìm thấy tên tỉnh/thành phố:", { cityCode, provinces });
        return;
      }
      if (!districtName) {
        setServerError("Vui lòng chọn quận/huyện hợp lệ.");
        console.warn("Không tìm thấy tên quận/huyện:", { districtCode, districts });
        return;
      }
      if (!wardName) {
        setServerError("Vui lòng chọn phường/xã hợp lệ.");
        console.warn("Không tìm thấy tên phường/xã:", { wardCode, wards });
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
          city: cityName, // Chỉ gửi tên
          district: districtName, // Chỉ gửi tên
          ward: wardName, // Chỉ gửi tên
          description: data.description,
        },
      };

      console.log("✅ Dữ liệu gửi đi:", formattedData);

      // Kiểm tra để đảm bảo không có mã trong address
      if (
        formattedData.address.city === data.city ||
        formattedData.address.district === data.district ||
        formattedData.address.ward === data.ward
      ) {
        console.error("Lỗi: Dữ liệu trong address chứa mã thay vì tên:", formattedData.address);
        setServerError("Lỗi dữ liệu địa chỉ. Vui lòng thử lại.");
        return;
      }

      await createUser(formattedData);
      alert("Đăng ký thành công!");
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Lỗi khi đăng ký:", err);
      setServerError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

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
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">
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

          {/* Họ tên và Tên đăng nhập */}
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
              {errors.fullname && <p className="text-sm text-red-400 mt-1">Vui lòng nhập họ và tên</p>}
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
              {errors.username && <p className="text-sm text-red-400 mt-1">Vui lòng nhập tên đăng nhập</p>}
            </div>
          </div>

          {/* Email và Số điện thoại */}
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
              {errors.email && <p className="text-sm text-red-400 mt-1">Vui lòng nhập email hợp lệ</p>}
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
              {errors.phone && <p className="text-sm text-red-400 mt-1">Vui lòng nhập số điện thoại</p>}
            </div>
          </div>

          {/* Ngày sinh và Giới tính */}
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
              {errors.dob && <p className="text-sm text-red-400 mt-1">Vui lòng chọn ngày sinh</p>}
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
              {errors.gender && <p className="text-sm text-red-400 mt-1">Vui lòng chọn giới tính</p>}
            </div>
          </div>

          {/* Tỉnh/Thành phố và Quận/Huyện */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-900">
                Tỉnh/Thành phố
              </label>
              <select
                id="city"
                {...register("city", { required: true })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 focus:outline-teal-300 sm:text-sm/6"
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
              {errors.city && <p className="text-sm text-red-400 mt-1">Vui lòng chọn tỉnh/thành phố</p>}
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
                {errors.district && <p className="text-sm text-red-400 mt-1">Vui lòng chọn quận/huyện</p>}
              </div>
            )}
          </div>

          {/* Phường/Xã và Địa chỉ chi tiết */}
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
                {errors.ward && <p className="text-sm text-red-400 mt-1">Vui lòng chọn phường/xã</p>}
              </div>
            )}

            {selectedWard && (
              <div className="w-1/2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                  Địa chỉ chi tiết
                </label>
                <input
                  id="description"
                  {...register("description", { required: true })}
                  className="block w-full border-b border-gray-300 px-3 py-1.5 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
                  placeholder="Địa chỉ chi tiết"
                />
                {errors.description && <p className="text-sm text-red-400 mt-1">Vui lòng nhập địa chỉ chi tiết</p>}
              </div>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: true, minLength: 6 })}
              className="block w-full border-b border-gray-300 px-3 py-1.5 text-gray-900 focus:border-teal-500 focus:outline-none sm:text-sm"
              placeholder="Mật khẩu"
            />
            {errors.password && <p className="text-sm text-red-400 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>}
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:bg-gray-300"
            disabled={
              !!errors.city ||
              !!errors.district ||
              !!errors.ward ||
              !selectedCity ||
              !selectedDistrict ||
              !selectedWard ||
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