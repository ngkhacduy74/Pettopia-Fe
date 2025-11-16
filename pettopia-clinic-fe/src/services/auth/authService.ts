import axios from "axios";
import { parseJwt } from "@/utils/jwt";

// Lấy base URL từ .env
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/auth`;

// Tạo instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor thêm token
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

// Đăng nhập
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
        // Lưu userRole vào localStorage
        localStorage.setItem("userRole", decoded.role);
        
        // Lưu userRole vào cookie với đầy đủ attributes
        const cookieAttributes = [
          `userRole=${decoded.role}`,
          'path=/',
          'max-age=86400',
          'SameSite=Lax'
        ];
        
        // Nếu là HTTPS, thêm Secure flag
        if (window.location.protocol === 'https:') {
          cookieAttributes.push('Secure');
        }
        
        document.cookie = cookieAttributes.join('; ');
        console.log("Đã lưu userRole vào localStorage và cookie:", decoded.role);
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

// Đăng ký
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

// services/auth/authService.ts (hoặc utils/authService.ts)

interface CookieOptions {
  path?: string;
  domain?: string;
  secure?: boolean;
}

/**
 * XÓA HOÀN TOÀN MỌI DỮ LIỆU ĐĂNG NHẬP
 * - localStorage: authToken, userRole, userRoles, refreshToken, userId, ...
 * - Cookie: authToken, userRole, userRoles, ... (dù path nào)
 */
export const logoutUser = (): void => {
  console.log('Bắt đầu đăng xuất...');

  // ================== 1. XÓA LOCALSTORAGE ==================
  const localStorageKeysToRemove = [
    'authToken',
    'userRole',
    'userRoles',
    'refreshToken',
    'userId',
    'clinicId',
    'vetId',
    // Thêm key nếu cần
  ];

  localStorageKeysToRemove.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      console.log(`✓ Đã xóa localStorage: ${key}`);
    }
  });

  // ================== 2. XÓA COOKIES ==================
  const cookieNamesToRemove = [
    'authToken',
    'userRole',
    'userRoles',
  ];

  const deleteCookie = (name: string) => {
    // Tạo chuỗi expires trong quá khứ
    const expires = new Date(0).toUTCString();
    
    // Xóa cookie với các tùy chọn khác nhau
    const cookieVariations = [
      // Variation 1: path=/ + SameSite=Lax
      `${name}=; path=/; expires=${expires}; SameSite=Lax`,
      // Variation 2: path=/ + Secure + SameSite=Lax
      `${name}=; path=/; expires=${expires}; Secure; SameSite=Lax`,
      // Variation 3: không path
      `${name}=; expires=${expires}`,
      // Variation 4: current pathname
      `${name}=; path=${window.location.pathname}; expires=${expires}`,
    ];

    cookieVariations.forEach(cookieString => {
      try {
        document.cookie = cookieString;
      } catch (e) {
        console.warn(`Không thể xóa cookie variant: ${name}`, e);
      }
    });
  };

  // Xóa từng cookie được biết
  cookieNamesToRemove.forEach(cookieName => {
    deleteCookie(cookieName);
    console.log(`✓ Đã cố gắng xóa cookie: ${cookieName}`);
  });

  // ================== 3. FALLBACK: XÓA TẤT CẢ COOKIES ==================
  // (Phòng trường hợp có cookie lạ không trong danh sách)
  try {
    const allCookies = document.cookie.split(';');
    const expires = new Date(0).toUTCString();
    
    allCookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name && name.length > 0) {
        // Xóa mà không cần biết path/domain, browser sẽ xóa từ current scope
        document.cookie = `${name}=; path=/; expires=${expires}`;
        document.cookie = `${name}=; expires=${expires}`;
        console.log(`✓ Đã xóa cookie: ${name}`);
      }
    });
  } catch (err) {
    console.warn('Lỗi khi xóa cookie fallback:', err);
  }

  console.log('✅ Đăng xuất thành công! Đã xóa hết localStorage & cookie.');
};