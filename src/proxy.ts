import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Auth is handled client-side via Firebase onAuthStateChanged in the dashboard layout.
  // Session cookie check is only enforced when Firebase Admin SDK is configured.
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login'],
};
