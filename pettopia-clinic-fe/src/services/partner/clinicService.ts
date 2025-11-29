import axios from "axios";

// Lấy base URL từ .env
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/clinic`;
const PARTNER_API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner`;
const HEALTHCARE_API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare`;

// Tạo instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
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

export interface AppointmentData {
  _id: string;
  user_id: string;
  customer?: string;
  partner?: string;
  pet_ids: string[];
  clinic_id: string;
  service_ids: string[];
  date: string;
  shift: string;
  status: string;
  created_by?: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  cancelled_by?: string;
}

export interface AppointmentsResponse {
  status: string;
  message: string;
  data: AppointmentData[];
  pagination: PaginationResponse;
}

export interface AppointmentDetailResponse {
  status: string;
  message: string;
  data: AppointmentData;
}

export const registerClinic = async (clinicData: ClinicData) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axiosInstance.post("/register", clinicData, {
      headers: { 'token': token },
    });
    console.log("API response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi đăng ký phòng khám:", error.response?.data || error.message);
    throw error;
  }
};

export const getClinicForms = async (page: number = 1, limit: number = 10) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axiosInstance.get(`/form?page=${page}&limit=${limit}`, {
      headers: { 'token': token },
    });
    return response.data as ClinicFormsResponse;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách form đăng ký phòng khám:", error);
    throw error;
  }
};

export const updateClinicFormStatus = async (formId: string, status: string, note?: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axiosInstance.post(`/status/${formId}`, {
      status,
      note: note || (status === 'approved' ? 'Phòng khám đủ điều kiện hoạt động' : 'Phòng khám không đủ điều kiện hoạt động')
    }, {
      headers: { 'token': token },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái phòng khám:", error);
    throw error;
  }
};

export const getClinicServices = async (page: number = 1, limit: number = 10, search?: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const params: Record<string, any> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const response = await axios.get(`${PARTNER_API_URL}/service/all`, {
      params,
      headers: { 'token': token }
    });
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
    const response = await axios.post(`${PARTNER_API_URL}/service`, serviceData, {
      headers: { 'token': token }
    });
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
    const response = await axios.put(`${PARTNER_API_URL}/service/${serviceId}`, serviceData, {
      headers: { 'token': token }
    });
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
    const response = await axios.delete(`${PARTNER_API_URL}/service/${serviceId}`, {
      headers: { 'token': token }
    });
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi xóa service:", error);
    throw new Error(error.response?.data?.message || 'Không thể xóa dịch vụ');
  }
};

export const getAppointments = async (page: number = 1, limit: number = 10) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.get(`${HEALTHCARE_API_URL}/appointments`, {
      params: { page, limit },
      headers: { 'token': token }
    });
    return response.data as AppointmentsResponse;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
    throw error;
  }
};

export const getAppointmentDetail = async (appointmentId: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.get(`${HEALTHCARE_API_URL}/appointments/${appointmentId}`, {
      headers: { 'token': token }
    });
    return response.data as AppointmentDetailResponse;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết lịch hẹn:", error);
    throw error;
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: string,
  cancel_reason?: string
) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const body: any = { status };
    if (cancel_reason) body.cancel_reason = cancel_reason;

    const url = `${HEALTHCARE_API_URL}/appointments/${appointmentId}/status`;
    console.log('Updating appointment status:', { url, method: 'PATCH', body });

    const response = await axios.patch(
      url,
      body,
      { headers: { 'token': token } }
    );
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi cập nhật trạng thái lịch hẹn:", error);
    console.error("Error details:", {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.url,
      method: error?.config?.method,
      data: error?.response?.data
    });
    throw error;
  }
};

export const sendInvitation = async (email: string, role: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.post(
      `${PARTNER_API_URL}/clinic/invitations`,
      { email, role },
      { headers: { 'token': token } }
    );
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi gửi lời mời:", error.response?.data || error.message);
    throw error;
  }
};