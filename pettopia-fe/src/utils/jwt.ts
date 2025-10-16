import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  fullname: string;
  email: { email_address: string; verified: boolean };
  phone: { phone_number: string; verified: boolean };
  username: string;
  role: string;
  address: { city: string; district: string; ward: string; description: string };
  reward_point: number;
  dob: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  iat: number;
  exp: number;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (e) {
    console.error('Lỗi khi giải mã token:', e);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = parseJwt(token);
  if (!decoded) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}