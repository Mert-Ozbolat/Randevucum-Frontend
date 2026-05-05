import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register', '/pricing', '/business'];
const authPaths = ['/login', '/register'];

function isPublic(pathname: string): boolean {
  if (pathname.startsWith('/business/')) return true;
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAuthPath(pathname: string): boolean {
  return authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isAuthPath(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
