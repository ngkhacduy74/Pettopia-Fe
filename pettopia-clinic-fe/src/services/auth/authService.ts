import axios from "axios";
import { parseJwt } from "@/utils/jwt";

// ✅ Lấy base URL từ biến môi trường
// const API_URL = process.env.NEXT_PUBLIC_API_URL
`${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/auth`;
// : "http://localhost:3000/api/v1/auth";

// ✅ Tạo instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor để thêm token vào Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Hàm đăng nhập
export const loginUser = async (loginData: {
  username: string;
  password: string;
}) => {
  try {
    const response = await axiosInstance.post("/login", loginData);
    const { token } = response.data;

    console.log("API Response:", response.data);

    if (token) {
      localStorage.setItem("authToken", token);

      const decoded = parseJwt(token);
      if (decoded && decoded.role) {
        document.cookie = `userRole=${decoded.role}; path=/; max-age=86400;`;
        console.log("Đã lưu userRole vào cookie:", decoded.role);
      } else {
        console.warn("Không tìm thấy role trong token đã giải mã");
      }
    } else {
      console.warn("Không tìm thấy token trong phản hồi API");
    }

    return response.data;
  } catch (error: any) {
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

// ✅ Hàm đăng xuất
export const logoutUser = () => {
  localStorage.removeItem("authToken");
  document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};
