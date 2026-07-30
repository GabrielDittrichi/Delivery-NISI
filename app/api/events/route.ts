import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';
import { isJsonTooLarge, isRateLimited } from '@/lib/rate-limit';

const allowedEvents = new Set([
  'add_to_cart',
  'checkout_started',
  'add_payment_info',
  'coupon_applied',
  'search',
  'whatsapp_click',
  'linktree_view',
  'linktree_click',
]);

export async function POST(req: Request) {
  try {
    if (isJsonTooLarge(req, 16 * 1024)) {
      return NextResponse.json({ message: 'Payload muito grande' }, { status: 413 });
    }
    if (isRateLimited(req, 'events', 80, 60_000)) {
      return NextResponse.json({ message: 'Muitas requisições' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const type = typeof body?.type === 'string' ? body.type : '';

    if (!allowedEvents.has(type)) {
      return NextResponse.json({ message: 'Evento inválido' }, { status: 400 });
    }

    const metadata =
      body?.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
        ? body.metadata
        : undefined;

    if (metadata && JSON.stringify(metadata).length > 8 * 1024) {
      return NextResponse.json({ message: 'Metadados muito grandes' }, { status: 413 });
    }

    await trackEvent(
      type as 'add_to_cart' | 'checkout_started' | 'add_payment_info' | 'coupon_applied' | 'search' | 'whatsapp_click' | 'linktree_view' | 'linktree_click',
      metadata
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to record analytics event:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
