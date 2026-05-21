import { NextResponse } from 'next/server';
import { trackVisit } from '@/lib/analytics';

function getClientIp(req: Request): string | undefined {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim();
  const realIp = req.headers.get('x-real-ip');
  return realIp || undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const referer = typeof body?.referer === 'string' ? body.referer : undefined;

    await trackVisit({
      userAgent: req.headers.get('user-agent') || undefined,
      referer,
      ip: getClientIp(req),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Failed to track visit:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

