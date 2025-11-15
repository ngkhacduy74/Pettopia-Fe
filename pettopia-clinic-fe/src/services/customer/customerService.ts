import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.PETTOPIA_API_URL}/customer`
  : "http://localhost:3000/api/v1/customer";

export async function getCustomerData(page: number, limit: number) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, {
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch customer data");
  }
}

export async function getCustomerById(id: string | number) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Customer not found");
    }
    throw new Error("Failed to fetch customer by ID");
  }
}

// THÊM HÀM MỚI: Lấy tổng số user theo role
export async function getCustomerTotalDetail() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.get(`${API_URL}/total/detail`, {
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch total customer details");
  }
}
