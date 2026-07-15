import { NextResponse } from 'next/server';
import { trackMetaCapiEvent, parseMetaCookies, getClientIp, generateEventId } from '@/lib/meta-capi';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { eventName, eventId, customData, userData } = body;

    if (!eventName) {
      return NextResponse.json({ message: 'eventName obrigatório' }, { status: 400 });
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
        phone: typeof userData?.phone === 'string' ? userData.phone : undefined,
        email: typeof userData?.email === 'string' ? userData.email : undefined,
      },
      customData,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Meta CAPI proxy error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
