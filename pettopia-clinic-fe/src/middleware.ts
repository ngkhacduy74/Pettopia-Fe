import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role hierarchy and their accessible paths
const rolePermissions: { [key: string]: string[] } = {
  Admin: ['/admin', '/staff', '/clinic', '/vet', '/user'],
  Staff: ['/staff', '/clinic', '/vet', '/user'],
  Clinic: ['/clinic', '/vet', '/user'],
  Vet: ['/vet', '/user'],
  User: ['/user'],
};

// Middleware function to handle role-based authorization
export function middleware(request: NextRequest) {
  // Since localStorage is client-side, we rely on headers or cookies for server-side checks
  // For this example, assume the role is passed via a cookie or header
  // In a real app, you might use a server-side session or JWT
  const userRole = request.cookies.get('userRole')?.value || null;

  const { pathname } = request.nextUrl;

  // If no userRole (not logged in), restrict access to protected routes
  if (!userRole) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/staff') ||
      pathname.startsWith('/clinic') ||
      pathname.startsWith('/vet') ||
      pathname.startsWith('/user')
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Check if the user has permission to access the requested path
  const allowedPaths = rolePermissions[userRole] || [];
  const isAuthorized = allowedPaths.some((path) => pathname.startsWith(path));

  if (!isAuthorized) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure matcher to apply middleware to specific paths
export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/clinic/:path*', '/vet/:path*', '/user/:path*'],
};