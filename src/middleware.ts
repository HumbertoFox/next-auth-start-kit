import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import middlewareConfig from './middleware.config';

const { auth } = NextAuth(middlewareConfig);

export default auth(async function middleware(req: NextRequest) {
  const session = await auth();
  const isAuthenticated = !!session;
  const isAuthPage = ['/login', '/register'].includes(req.nextUrl.pathname);

  if (!isAuthenticated && req.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*'],
};