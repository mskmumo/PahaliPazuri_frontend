import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware disabled - using client-side auth guards in layouts instead
  // This is because Next.js middleware can't access localStorage where auth tokens are stored
  // All authentication and authorization is handled client-side in the respective layouts:
  // - frontend/app/(tenant)/layout.tsx
  // - frontend/app/(admin)/layout.tsx  
  // - frontend/app/(staff)/layout.tsx
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/tenant/:path*',
  ],
};
