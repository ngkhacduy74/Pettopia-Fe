import axios from "axios";
import { parseJwt } from "@/utils/jwt"; // Import parseJwt từ jwt.ts
import { logAllCookies, logAuthStatus } from "@/utils/cookieHelper"; // Import cookie helpers

// LẤY ĐỘNG TỪ .env.local — KHÔNG FALLBACK
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/auth`;

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
    const { token } = response.data;

    // Kiểm tra dữ liệu từ API
    console.log("API Response:", response.data); // Debug để kiểm tra dữ liệu

    // Lưu token vào localStorage
    if (token) {
      localStorage.setItem("authToken", token);

      // Giải mã token để lấy userRole
      const decoded = parseJwt(token);
      if (decoded && decoded.role) {
        // Lưu userRole vào localStorage (đảm bảo là string)
        const roleValue = typeof decoded.role === 'string' ? decoded.role : JSON.stringify(decoded.role);
        localStorage.setItem("userRole", roleValue);
        
        // Lưu userRole vào cookie với đầy đủ attributes (encode để an toàn)
        const cookieAttributes = [
          `userRole=${encodeURIComponent(roleValue)}`,
          'path=/',
          'max-age=86400',
          'SameSite=Lax'
        ];
        
        // Nếu là HTTPS, thêm Secure flag
        if (window.location.protocol === 'https:') {
          cookieAttributes.push('Secure');
        }
        
        document.cookie = cookieAttributes.join('; ');
        // console.log("Đã lưu userRole vào localStorage và cookie:", decoded.role);
      } else {
        console.warn("Không tìm thấy role trong token đã giải mã");
      }
    } else {
      console.warn("Không tìm thấy token trong phản hồi API");
    }

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

// API gửi OTP đến email để reset password
export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post("/forgot-password", {
      email,
    });
    console.log("OTP đã được gửi đến email:", email);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu forgot password:", error);
    throw error;
  }
};

// API reset password với OTP
export const resetPassword = async (resetData: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  try {
    const response = await axiosInstance.post("/reset-password", resetData);
    console.log("Mật khẩu đã được reset thành công");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi reset password:", error);
    throw error;
  }
};

// API đổi mật khẩu
export const changePassword = async (changePasswordData: {
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      throw new Error('Token not found');
    }

    const response = await axios.post(
      `${API_URL}/auth/change-password`,
      changePasswordData,
      {
        headers: {
          'Content-Type': 'application/json',
          token: authToken,
        },
      }
    );
    
    console.log("Mật khẩu đã được đổi thành công");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    throw error;
  }
};

/**
 * XÓA HOÀN TOÀN MỌI DỮ LIỆU ĐĂNG NHẬP & SESSION
 * - localStorage: authToken, userRole, userRoles, refreshToken, userId, chatMessages, v.v...
 * - sessionStorage: tất cả session data
 * - Cookie: tất cả cookies (xóa bằng multiple variations)
 * - Axios headers: xóa Authorization header
 * - History: ngăn quay lại bằng replaceState + pushState
 * - IndexedDB: xóa tất cả databases nếu có
 */
export const logoutUser = (): void => {
  console.log('🔄 Bắt đầu quy trình đăng xuất...');
  
  // Log trạng thái auth trước logout
  logAuthStatus();

  // Kiểm tra môi trường client
  if (typeof window === 'undefined') {
    console.warn('⚠️  logoutUser chỉ có thể chạy trên client-side');
    return;
  }

  // ================== 1. XÓA AXIOS HEADERS ==================
  try {
    // Xóa Authorization header từ axios default
    delete axiosInstance.defaults.headers.common['Authorization'];
    console.log('✓ Đã xóa Authorization header từ axios');
  } catch (e) {
    console.warn('⚠️  Lỗi khi xóa axios header:', e);
  }

  // ================== 2. XÓA LOCALSTORAGE ==================
  const localStorageKeysToRemove = [
    // Auth & User info
    'authToken',
    'userRole',
    'userRoles',
    'refreshToken',
    'userId',
    'clinicId',
    'vetId',
    'userEmail',
    // Chat & Messages
    'chatMessages',
    'pettopia_chat_userId',
    // Other potential keys
    'pettopia_user_preferences',
    'pettopia_last_route',
  ];

  try {
    localStorageKeysToRemove.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`✓ Xóa localStorage: ${key}`);
      }
    });
  } catch (e) {
    console.warn('⚠️  Lỗi khi xóa localStorage:', e);
  }

  // ================== 3. XÓA SESSION STORAGE ==================
  try {
    sessionStorage.clear();
    console.log('✓ Đã xóa tất cả sessionStorage');
  } catch (e) {
    console.warn('⚠️  Lỗi khi xóa sessionStorage:', e);
  }

  // ================== 4. XÓA COOKIES (MULTIPLE METHODS) ==================
  const deleteCookie = (name: string) => {
    const expires = new Date(0).toUTCString();
    const currentDomain = window.location.hostname;
    
    // Debug: log cookie hiện tại trước khi xoá
    const beforeDelete = document.cookie;
    console.log(`📋 Cookie trước khi xoá ${name}:`, beforeDelete);
    
    // Các variation để đảm bảo xóa được cookie dù lưu như thế nào
    const cookieVariations = [
      // Basic: set value thành empty string
      `${name}=`,
      `${name}=; path=/`,
      // Với expires = past date
      `${name}=; path=/; expires=${expires}`,
      `${name}=; path=/; expires=${expires}; SameSite=Strict`,
      `${name}=; path=/; expires=${expires}; SameSite=Lax`,
      // Với Secure flag
      `${name}=; path=/; expires=${expires}; Secure`,
      `${name}=; path=/; expires=${expires}; Secure; SameSite=Lax`,
      // Max-age=0 (modern way)
      `${name}=; path=/; max-age=0`,
      `${name}=; max-age=0`,
      // Thử với domain (nếu có)
      `${name}=; path=/; expires=${expires}; domain=${currentDomain}`,
      `${name}=; path=/; expires=${expires}; domain=.${currentDomain}`,
      // Không có path
      `${name}=; expires=${expires}`,
    ];

    // Thực hiện xoá với tất cả variations
    let deletedCount = 0;
    cookieVariations.forEach(cookieString => {
      try {
        document.cookie = cookieString;
        deletedCount++;
      } catch (e) {
        // Silently fail - some variations might not be valid
      }
    });
    
    // Debug: log cookie sau khi xoá
    const afterDelete = document.cookie;
    console.log(`✓ Đã cố xoá cookie "${name}" bằng ${deletedCount} variations. Cookie sau xoá:`, afterDelete);
  };

  const cookieNamesToRemove = [
    'authToken',
    'userRole',
    'userRoles',
    'refreshToken',
    'userId',
    'clinicId',
    'vetId',
  ];

  // Xóa từng cookie được biết
  cookieNamesToRemove.forEach(cookieName => {
    deleteCookie(cookieName);
  });

  // ================== 5. FALLBACK: XÓA TẤT CẢ COOKIES ==================
  // Xóa mọi cookie không rõ tên bằng cách parse document.cookie
  try {
    const allCookies = document.cookie.split(';');
    const expires = new Date(0).toUTCString();
    
    allCookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name && name.length > 0) {
        // Xóa cookie với multiple variations
        document.cookie = `${name}=; path=/; expires=${expires}`;
        document.cookie = `${name}=; expires=${expires}`;
        document.cookie = `${name}=; max-age=0`;
      }
    });
    console.log('✓ Đã xóa tất cả cookies via fallback');
  } catch (err) {
    console.warn('⚠️  Lỗi khi xóa cookie fallback:', err);
  }

  // ================== 6. XÓA INDEXEDDB (NẾU CÓ) ==================
  // Xóa tất cả IndexedDB databases
  if (typeof indexedDB !== 'undefined') {
    try {
      // Lấy danh sách databases và xóa từng cái
      // Note: Không có cách lấy danh sách trực tiếp, nhưng có thể xóa những cái biết
      const dbNames = [
        'pettopia-db',
        'pettopia_cache',
        'chat_db',
        'messages_db',
      ];
      
      dbNames.forEach(dbName => {
        try {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => console.log(`✓ Đã xóa IndexedDB: ${dbName}`);
          request.onerror = () => console.warn(`⚠️  Không thể xóa IndexedDB: ${dbName}`);
        } catch (e) {
          // Silently fail
        }
      });
    } catch (e) {
      console.warn('⚠️  Lỗi khi xóa IndexedDB:', e);
    }
  }

  // ================== 7. NGĂN CHẶN QUAY LẠI (BACK BUTTON) ==================
  try {
    // Xóa history khỏi browser history stack
    window.history.replaceState(null, '', '/auth/login');
    window.history.pushState(null, '', '/auth/login');
    console.log('✓ Đã xóa history - ngăn chặn quay lại');
  } catch (err) {
    console.warn('⚠️  Lỗi khi xóa history:', err);
  }

  // ================== 8. CLEAR BROWSER CACHE (VIA SERVICE WORKER - OPTIONAL) ==================
  // Nếu có service worker, có thể gửi message để xóa cache
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
      });
      console.log('✓ Đã gửi signal xóa service worker cache');
    } catch (e) {
      console.warn('⚠️  Lỗi khi gửi message đến service worker:', e);
    }
  }

  console.log('✅ Đăng xuất thành công! Đã xóa hết localStorage, cookie, history, sessionStorage & cache.');
  
  // Log trạng thái auth sau logout
  console.log('📊 === VERIFY LOGOUT ===');
  logAuthStatus();
};