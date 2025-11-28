import axios from "axios";

// Lấy base URL từ .env
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/customer`;

// Tạo instance Axios với interceptor
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor thêm token vào header
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

export async function getCustomerData(page: number, limit: number) {
  try {
    const response = await axiosInstance.get(`/?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error.response?.data || error.message);
    throw error;
  }
}

export async function getCustomerById(id: string | number) {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Unknown error';
    if (error.response?.status === 404) {
      console.error("Khách hàng không tìm thấy:", errorMsg);
    } else {
      console.error("Lỗi khi lấy chi tiết khách hàng:", errorMsg);
    }
    throw new Error(errorMsg);
  }
}

export async function getCustomerTotalDetail() {
  try {
    const response = await axiosInstance.get(`/total/detail`);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy tổng chi tiết khách hàng:", error.response?.data || error.message);
    throw error;
  }
}