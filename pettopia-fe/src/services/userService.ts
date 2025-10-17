import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/auth";

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