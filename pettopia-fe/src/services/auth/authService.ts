import axios from "axios";
import { parseJwt } from "@/utils/jwt"; // Import parseJwt từ jwt.ts

// LẤY ĐỘNG TỪ .env.local — KHÔNG FALLBACK
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/auth`;

// Tạo instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (loginData: {
  username: string;
  password: string;
}) => {
  try {
    const response = await axiosInstance.post("/login", loginData);
    const { token } = response.data;

    // Kiểm tra dữ liệu từ API
    console.log("API Response:", response.data); // Debug để kiểm tra dữ liệu

    // Lưu token vào localStorage
    if (token) {
      localStorage.setItem("authToken", token);

      // Giải mã token để lấy userRole
      const decoded = parseJwt(token);
      if (decoded && decoded.role) {
        document.cookie = `userRole=${decoded.role}; path=/; max-age=86400;`; // Cookie hết hạn sau 1 ngày
        console.log("Đã lưu userRole vào cookie:", decoded.role); // Debug để xác nhận
      } else {
        console.warn("Không tìm thấy role trong token đã giải mã");
      }
    } else {
      console.warn("Không tìm thấy token trong phản hồi API");
    }

    return response.data;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    throw error;
  }
};

export const createUser = async (userData: {
  fullname: string;
  username: string;
  email_address: string;
  phone_number: string;
  gender: string;
  dob: string;
  password: string;
  address: {
    city: string;
    district: string;
    ward: string;
    description: string;
  };
}) => {
  try {
    const response = await axiosInstance.post("/register", userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    throw error;
  }
};

// API gửi OTP đến email để reset password
export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post("/forgot-password", {
      email,
    });
    console.log("OTP đã được gửi đến email:", email);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu forgot password:", error);
    throw error;
  }
};

// API reset password với OTP
export const resetPassword = async (resetData: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  try {
    const response = await axiosInstance.post("/reset-password", resetData);
    console.log("Mật khẩu đã được reset thành công");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi reset password:", error);
    throw error;
  }
};

export const logoutUser = () => {
  // Danh sách các key cần xóa
  const keysToRemove = ["authToken", "userRole", "refreshToken", "userId"];

  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Xóa tất cả cookie liên quan
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    if (["userRole", "authToken"].includes(name)) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  });

  console.log("Đã đăng xuất hoàn toàn!");
};