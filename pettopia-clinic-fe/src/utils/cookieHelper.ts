/**
 * Utility functions để quản lý cookies
 */

/**
 * Parse tất cả cookies thành object
 * @returns Object với key-value của tất cả cookies
 */
export const getAllCookies = (): Record<string, string> => {
  if (typeof document === 'undefined') return {};
  
  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.split('=');
    const trimmedName = name.trim();
    if (trimmedName) {
      cookies[trimmedName] = decodeURIComponent(value?.trim() || '');
    }
  });
  return cookies;
};

/**
 * Log tất cả cookies hiện tại
 */
export const logAllCookies = (label?: string) => {
  if (typeof document === 'undefined') {
    console.log('⚠️  Cookie utilities chỉ hoạt động trên client-side');
    return;
  }
  
  const cookies = getAllCookies();
  console.log(`📍 ${label || 'Current Cookies'}:`, cookies);
  console.log(`📊 Tổng cộng: ${Object.keys(cookies).length} cookies`);
};

/**
 * Kiểm tra xem cookie có tồn tại không
 */
export const hasCookie = (name: string): boolean => {
  const cookies = getAllCookies();
  return name in cookies;
};

/**
 * Lấy giá trị của một cookie
 */
export const getCookie = (name: string): string | null => {
  const cookies = getAllCookies();
  return cookies[name] || null;
};

/**
 * Kiểm tra xem cookie `userRole` có tồn tại không
 */
export const hasUserRoleCookie = (): boolean => {
  return hasCookie('userRole');
};

/**
 * Lấy giá trị của cookie `userRole`
 */
export const getUserRoleCookie = (): string | null => {
  return getCookie('userRole');
};

/**
 * Kiểm tra xem có bất kỳ auth-related cookie nào tồn tại không
 */
export const hasAnyAuthCookie = (): boolean => {
  const authCookieNames = ['authToken', 'userRole', 'userRoles', 'refreshToken'];
  return authCookieNames.some(name => hasCookie(name));
};

/**
 * Kiểm tra xem có bất kỳ auth-related localStorage nào tồn tại không
 */
export const hasAnyAuthStorage = (): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  const authStorageKeys = ['authToken', 'userRole', 'userRoles', 'refreshToken', 'userId'];
  return authStorageKeys.some(key => localStorage.getItem(key) !== null);
};

/**
 * Log trạng thái auth hiện tại (localStorage + cookies)
 */
export const logAuthStatus = () => {
  console.log('🔐 === AUTH STATUS ===');
  
  // Check localStorage
  if (typeof localStorage !== 'undefined') {
    console.log('📦 localStorage:', {
      authToken: localStorage.getItem('authToken') ? '✓ exists' : '✗ empty',
      userRole: localStorage.getItem('userRole') ? `✓ ${localStorage.getItem('userRole')}` : '✗ empty',
      userId: localStorage.getItem('userId') ? `✓ ${localStorage.getItem('userId')}` : '✗ empty',
    });
  }
  
  // Check cookies
  logAllCookies('🍪 Cookies');
};
