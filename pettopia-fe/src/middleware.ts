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
  // Assume user roles are passed as a JSON string in a cookie or header
  const userRolesJson = request.cookies.get('userRoles')?.value || null;
  let userRoles: string[] = [];

  try {
    // Parse JSON string to get array of roles
    userRoles = userRolesJson ? JSON.parse(userRolesJson) : [];
    if (!Array.isArray(userRoles)) {
      throw new Error('Invalid roles format');
    }
  } catch (error) {
    console.error('Error parsing user roles:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }

  const { pathname } = request.nextUrl;

  // If no userRoles (not logged in), restrict access to protected routes
  if (!userRoles.length) {
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

  // Check if the user has at least one role that allows access to the requested path
  const isAuthorized = userRoles.some((role) => {
    const allowedPaths = rolePermissions[role] || [];
    return allowedPaths.some((path) => pathname.startsWith(path));
  });

  if (!isAuthorized) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure matcher to apply middleware to specific paths
export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/clinic/:path*', '/vet/:path*', '/user/:path*'],
};