import axios from "axios";

// Base URL
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/customer`;

// Hàm hỗ trợ lấy token (để không lặp code)
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No authentication token found");
  return token;
};

// Hàm tạo headers có token (dùng chung)
const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    token: getAuthToken(), // giống hệt Service 2
  },
});

export async function getCustomerData(page: number, limit: number) {
  try {
    const response = await axios.get(
      `${API_URL}/?page=${page}&limit=${limit}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error.response?.data || error.message);
    throw error;
  }
}

export async function getCustomerById(id: string | number) {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const respData = error.response?.data;
    const errorMsg = respData?.message || respData || error.message || 'Unknown error';

    // Log detailed info for debugging
    console.error(`getCustomerById failed (id=${id}) status=${status}`, respData || error.message);

    // If the customer is not found or caller is unauthorized, return null so callers can continue
    if (status === 404) {
      console.warn("Khách hàng không tìm thấy:", errorMsg);
      return null;
    }

    if (status === 401 || status === 403) {
      console.warn("Không có quyền truy cập chi tiết khách hàng:", errorMsg);
      return null;
    }

    // For other errors, rethrow so upstream can handle/retry
    throw new Error(errorMsg);
  }
}

export async function getCustomerTotalDetail() {
  try {
    const response = await axios.get(`${API_URL}/total/detail`, getAuthHeaders());
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy tổng chi tiết khách hàng:", error.response?.data || error.message);
    throw error;
  }
}