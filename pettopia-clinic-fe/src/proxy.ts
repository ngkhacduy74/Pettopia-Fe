import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role hierarchy and their accessible paths
const rolePermissions: { [key: string]: string[] } = {
  Admin: ['/admin'],
  Staff: ['/staff'],
  Clinic: ['/clinic'],
  Vet: ['/vet'],
  User: ['/user'],
};

// Middleware function to handle role-based authorization
export function proxy(request: NextRequest) {
  // Get user roles from cookie
  const userRoleJson = request.cookies.get('userRole')?.value || null;
  let userRole: string[] = [];

  try {
    if (userRoleJson) {
      // Try parsing as JSON array
      try {
        userRole = JSON.parse(userRoleJson);
        if (!Array.isArray(userRole)) {
          throw new Error('Invalid roles format');
        }
      } catch {
        // Fallback to comma-separated string
        userRole = userRoleJson.split(',').map((role) => role.trim());
        if (!userRole.every((role) => typeof role === 'string' && role)) {
          throw new Error('Invalid roles format');
        }
      }
    }
  } catch (error) {
    console.error('Error parsing user roles:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }

  const { pathname } = request.nextUrl;

  // If no userRole (not logged in), restrict access to protected routes
  if (!userRole.length) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/staff') ||
      pathname.startsWith('/clinic') ||
      pathname.startsWith('/vet') ||
      pathname.startsWith('/user')
    ) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      // Thêm header để ngăn browser cache trang đó
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
    return NextResponse.next();
  }

  // Check if the user has a role that allows access to the requested path
  const isAuthorized = userRole.some((role) => {
    const allowedPaths = rolePermissions[role] || [];
    return allowedPaths.some((path) => pathname.startsWith(path));
  });

  if (!isAuthorized) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  const response = NextResponse.next();
  // Thêm header ngăn cache cho tất cả protected routes
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

// Configure matcher to apply middleware to specific paths
export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/clinic/:path*', '/vet/:path*', '/user/:path*'],
};