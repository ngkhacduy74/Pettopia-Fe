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
    const response = await axios.get(`${API_URL}/total/detail`, getAuthHeaders());
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy tổng chi tiết khách hàng:", error.response?.data || error.message);
    throw error;
  }
}