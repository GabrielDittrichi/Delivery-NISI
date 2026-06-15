import { NextRequest, NextResponse } from 'next/server';

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin"',
    },
  });
}

function isProtectedPath(pathname: string) {
  if (pathname.startsWith('/admin')) return true;
  if (pathname === '/api/coupons/validate') return false;
  if (pathname.startsWith('/api/coupons')) return true;
  if (pathname.startsWith('/api/upload')) return true;
  return false;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const users = (process.env.ADMIN_USERS || process.env.ADMIN_USER || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  const pass = process.env.ADMIN_PASS;
  if (users.length === 0 || !pass) {
    return unauthorized();
  }

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) return unauthorized();

  try {
    const decoded = Buffer.from(auth.slice('Basic '.length), 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    if (idx === -1) return unauthorized();
    const u = decoded.slice(0, idx);
    const p = decoded.slice(idx + 1);
    if (!users.includes(u) || p !== pass) return unauthorized();
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/coupons/:path*', '/api/upload'],
};
