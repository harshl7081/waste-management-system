import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that don't require authentication
const publicPaths = ['/login', '/signup', '/'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths without authentication
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Redirect to login if no token is present
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Add user info to headers for API routes
    const headers = new Headers(request.headers);
    headers.set('x-user-id', payload.sub as string);
    headers.set('x-user-role', payload.role as string);

    // Continue with the request
    return NextResponse.next({
      headers,
    });
  } catch (error) {
    // If token is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

// Configure which routes should be protected
export const config = {
  matcher: [
    '/api/:path*',
    '/classification',
    '/monitoring',
    '/rewards',
    '/admin/:path*',
  ],
}; 