import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';

const allowedEvents = new Set(['add_to_cart', 'checkout_started']);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = typeof body?.type === 'string' ? body.type : '';

    if (!allowedEvents.has(type)) {
      return NextResponse.json({ message: 'Evento invalido' }, { status: 400 });
    }

    const metadata =
      body?.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
        ? body.metadata
        : undefined;

    await trackEvent(type as 'add_to_cart' | 'checkout_started', metadata);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to record analytics event:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

