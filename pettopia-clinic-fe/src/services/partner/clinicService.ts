import axios from "axios";

// Lấy base URL từ biến môi trường (không fallback)
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/partner`;

// Tạo instance Axios (dùng cho các endpoint /clinic/…)
const clinicAxios = axios.create({
  baseURL: `${API_URL}/clinic`,
  headers: {
    "Content-Type": "application/json",
  },
});

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

/* ---------- Đăng ký phòng khám ---------- */
export const registerClinic = async (clinicData: ClinicData) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await clinicAxios.post("/register", clinicData, {
      headers: { token },
    });
    console.log("API response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi đăng ký phòng khám:", error.response?.data || error.message);
    throw error;
  }
};

/* ---------- Lấy danh sách form đăng ký ---------- */
export const getClinicForms = async (page: number = 1, limit: number = 10) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await clinicAxios.get(`/form?page=${page}&limit=${limit}`, {
      headers: { token },
    });
    return response.data as ClinicFormsResponse;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách form đăng ký phòng khám:", error);
    throw error;
  }
};

/* ---------- Cập nhật trạng thái form ---------- */
export const updateClinicFormStatus = async (formId: string, status: string, note?: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await clinicAxios.post(
      `/status/${formId}`,
      {
        status,
        note: note ?? (status === 'approved' ? 'Phòng khám đủ điều kiện hoạt động' : 'Phòng khám không đủ điều kiện hoạt động')
      },
      { headers: { token } }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái phòng khám:", error);
    throw error;
  }
};

/* ---------- Service (dùng API_URL trực tiếp) ---------- */
export const getClinicServices = async (page: number = 1, limit: number = 10, search?: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  const params: Record<string, any> = { page, limit };
  if (search?.trim()) params.search = search.trim();

  try {
    const response = await axios.get(`${API_URL}/service/all`, { params, headers: { token } });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách service:", error);
    throw error;
  }
};

export const createClinicService = async (serviceData: any) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.post(`${API_URL}/service`, serviceData, { headers: { token } });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo service:", error);
    throw error;
  }
};

export const updateClinicService = async (serviceId: string, serviceData: any) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.put(`${API_URL}/service/${serviceId}`, serviceData, { headers: { token } });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật service:", error);
    throw error;
  }
};

export const deleteClinicService = async (serviceId: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.delete(`${API_URL}/service/${serviceId}`, { headers: { token } });
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi xóa service:", error);
    throw new Error(error.response?.data?.message || 'Không thể xóa dịch vụ');
  }
};