import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If user goes to /admin, redirect to dashboard (if logged in) or login (if not)
  if (pathname === '/admin') {
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Protect all /admin/:path routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!token) {
      // Not logged in? Send to login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. If logged in and trying to access /admin/login, send to dashboard
  if (pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on /admin routes
export const config = {
  matcher: ['/admin/:path*'],
};