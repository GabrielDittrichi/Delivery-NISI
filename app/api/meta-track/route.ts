import { NextResponse } from 'next/server';
import { trackMetaCapiEvent, parseMetaCookies, getClientIp, generateEventId } from '@/lib/meta-capi';
import { isJsonTooLarge, isRateLimited } from '@/lib/rate-limit';

const allowedMetaEvents = new Set([
  'PageView',
  'ViewContent',
  'Search',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'CouponApplied',
  'WhatsAppClick',
  'LinktreeView',
  'LinktreeClick',
]);

export async function POST(req: Request) {
  try {
    if (isJsonTooLarge(req, 16 * 1024)) {
      return NextResponse.json({ message: 'Payload muito grande' }, { status: 413 });
    }
    if (isRateLimited(req, 'meta-track', 80, 60_000)) {
      return NextResponse.json({ message: 'Muitas requisições' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { eventName, eventId, customData, userData } = body;

    if (typeof eventName !== 'string' || !allowedMetaEvents.has(eventName)) {
      return NextResponse.json({ message: 'eventName inválido' }, { status: 400 });
    }

    if (customData && JSON.stringify(customData).length > 8 * 1024) {
      return NextResponse.json({ message: 'customData muito grande' }, { status: 413 });
    }

    const cookieData = parseMetaCookies(req.headers.get('cookie'));

    await trackMetaCapiEvent({
      eventName,
      eventId: eventId || generateEventId(),
      eventSourceUrl: req.headers.get('referer') || undefined,
      userData: {
        clientIp: getClientIp(req),
        clientUserAgent: req.headers.get('user-agent') || undefined,
        fbc: cookieData.fbc,
        fbp: cookieData.fbp,
        phone: typeof userData?.phone === 'string' ? userData.phone.slice(0, 32) : undefined,
        email: typeof userData?.email === 'string' ? userData.email.slice(0, 254) : undefined,
      },
      customData,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Meta CAPI proxy error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
