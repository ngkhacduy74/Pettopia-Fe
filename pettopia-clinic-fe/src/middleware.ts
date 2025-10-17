import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware triggered for:', pathname);

  // Lấy token từ header Authorization
  const authHeader = request.headers.get('authorization');
  let userRole = '';

  // Kiểm tra token chỉ cho /user/*
  if (pathname.startsWith('/user')) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('Không tìm thấy token trong header Authorization', { pathname });
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { role: string };
      userRole = decoded.role || '';
      console.log('Token decoded, role:', userRole);
      if (!userRole) {
        console.warn('Token không chứa role', { token, decoded });
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } else {
    // Nếu không phải /user/*, thử giải mã token nhưng không chặn truy cập
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { role: string };
        userRole = decoded.role || '';
        console.log('Token decoded for non-user route, role:', userRole);
      } catch (error) {
        console.error('Lỗi khi giải mã token, tiếp tục cho phép truy cập:', error);
      }
    }
  }

  // Quy tắc phân quyền
  const isAdmin = userRole === 'Admin';
  const isUser = userRole === 'User';
  const isStaff = userRole === 'Staff';

  // Kiểm tra URL
  if (pathname.startsWith('/admin') && userRole && !isAdmin) {
    console.warn('Truy cập /admin bị từ chối', { userRole });
    return NextResponse.redirect(new URL('/auth/login', request.url));
  } else if (pathname.startsWith('/user') && !(isAdmin || isUser || isStaff)) {
    console.warn('Truy cập /user bị từ chối', { userRole });
    return NextResponse.redirect(new URL('/auth/login', request.url));
  } else if (pathname.startsWith('/staff') && userRole && !(isAdmin || isStaff)) {
    console.warn('Truy cập /staff bị từ chối', { userRole });
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  console.log('Truy cập được phép', { pathname, userRole });
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/staff/:path*'],
};