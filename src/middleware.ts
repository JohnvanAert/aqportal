import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get('session');
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      if (pathname.startsWith('/admin') && session.role === 'USER') {
        return NextResponse.redirect(new URL('/profile', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};