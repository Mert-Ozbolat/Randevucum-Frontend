import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || '/';
    }
  }
  return pathname;
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = stripLocalePrefix(pathname);
  const token = request.cookies.get('token')?.value;

  if (pathWithoutLocale.startsWith('/dashboard')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    return intlMiddleware(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(tr|en|ru)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
