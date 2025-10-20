import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/partner/clinic";

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

export interface ClinicFormData {
  user_id: string;
  clinic_name: string;
  email: {
    email_address: string;
    verified: boolean;
  };
  phone: {
    phone_number: string;
    verified: boolean;
  };
  license_number: string;
  address: {
    city: string;
    district: string;
    ward: string;
    detail: string;
  };
  status: string;
  representative: {
    name: string;
    identify_number: string;
    responsible_licenses: string[];
    license_issued_date: string;
  };
  id: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
  review_by?: string;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClinicFormsResponse {
  success: boolean;
  message: string;
  pagination: PaginationResponse;
  data: ClinicFormData[];
}

interface ClinicData {
  user_id: string;
  clinic_name: string;
  email: { email_address: string };
  phone: { phone_number: string };
  license_number: string;
  address: {
    city: string;
    district: string;
    ward: string;
    detail: string;
  };
  representative: {
    name: string;
    identify_number: string;
    responsible_licenses: string[];
    license_issued_date: string;
  };
}

export const registerClinic = async (clinicData: ClinicData) => {
  try {
    const response = await axiosInstance.post("/register", clinicData);
    console.log("API response:", response.data); // Debug
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi đăng ký phòng khám:", error.response?.data || error.message);
    throw error;
  }
};

export const getClinicForms = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(`/form?page=${page}&limit=${limit}`);
    return response.data as ClinicFormsResponse;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách form đăng ký phòng khám:", error);
    throw error;
  }
};

export const updateClinicFormStatus = async (formId: string, status: string, note?: string) => {
  try {
    const response = await axiosInstance.post(`/status/${formId}`, {
      status,
      note: note || (status === 'approved' ? 'Phòng khám đủ điều kiện hoạt động' : 'Phòng khám không đủ điều kiện hoạt động')
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái phòng khám:", error);
    throw error;
  }
};