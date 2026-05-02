import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // If user goes to root ("/"), redirect to login page
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login_page', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};