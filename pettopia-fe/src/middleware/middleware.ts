import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy userRole từ header x-user-role (client gửi)
  const userRole = request.headers.get('x-user-role') || '';

  // Quy tắc phân quyền
  const isAdmin = userRole === 'Admin';
  const isUser = userRole === 'User';
  const isStaff = userRole === 'Staff';

  // Kiểm tra URL
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/login', request.url));
  } else if (pathname.startsWith('/user') && !(isAdmin || isUser || isStaff)) {
    return NextResponse.redirect(new URL('/login', request.url));
  } else if (pathname.startsWith('/staff') && !(isAdmin || isStaff)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/staff/:path*'],
};