import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ header Authorization
  const authHeader = request.headers.get('authorization');
  let userRole = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { role: string };
      userRole = decoded.role;
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
    }
  }

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