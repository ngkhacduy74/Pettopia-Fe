import axios from "axios";

// Base URL
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/customer`;

/**
 * Lấy token từ localStorage.
 * Hỗ trợ cả key 'authToken' và 'token'.
 * Trả về null nếu không tìm thấy (caller sẽ xử lý).
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  // ưu tiên 'authToken', fallback 'token'
  const token = localStorage.getItem("authToken") ?? null;
  return token;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["token"] = token; // server expects header key 'token' như Postman
  } else {
    // optional: console.warn để dễ debug khi token không có
    console.warn("No auth token found in localStorage (checked 'authToken' and 'token')");
  }
  return { headers };
};

export async function getCustomerById(id?: string | number | null) {
  try {
    const url = !id || id === "profile" ? `${API_URL}/profile` : `${API_URL}/${id}`;

    // Nếu muốn fail fast khi không có token, bật check này:
    // if (!getAuthToken()) throw new Error('No authentication token found');

    const response = await axios.get(url, getAuthHeaders());

    const respBody = response.data;
    return respBody?.data ?? respBody;
  } catch (error: any) {
    const status = error.response?.status;
    const respData = error.response?.data;
    const errorMsg = respData?.message || respData || error.message || "Unknown error";

    console.error(`getCustomerById failed (id=${id}) status=${status}`, respData || error.message);

    if (status === 404) {
      console.warn("Khách hàng không tìm thấy:", errorMsg);
      return null;
    }

    if (status === 401 || status === 403) {
      console.warn("Không có quyền truy cập chi tiết khách hàng:", errorMsg);
      return null;
    }

    throw new Error(errorMsg);
  }
}

/**
 * Lấy thông tin profile customer hiện tại (dùng token, không cần truyền id).
 * FE nên ưu tiên dùng hàm này cho trang hồ sơ cá nhân.
 */
export async function getCustomerProfile() {
  // backend mong muốn endpoint /customer/profile
  return getCustomerById("profile");
}