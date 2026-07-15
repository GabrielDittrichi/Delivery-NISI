import { createHash } from 'crypto';

const META_API_VERSION = 'v21.0';

function getConfig() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return null;
  return { pixelId, accessToken };
}

function hash(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export type MetaCapiUserData = {
  phone?: string;
  email?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
};

export type MetaCapiCustomData = Record<string, unknown> & {
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  contents?: { id: string; quantity: number; item_price: number }[];
  currency?: string;
  value?: number;
  num_items?: number;
  transaction_id?: string;
  coupon?: string;
  payment_method?: string;
};

export type MetaCapiEvent = {
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  userData: MetaCapiUserData;
  customData?: MetaCapiCustomData;
};

export async function trackMetaCapiEvent(event: MetaCapiEvent) {
  const config = getConfig();
  if (!config) return;

  const userData: Record<string, string | undefined> = {
    client_ip_address: event.userData.clientIp,
    client_user_agent: event.userData.clientUserAgent,
    fbc: event.userData.fbc,
    fbp: event.userData.fbp,
  };

  if (event.userData.phone) {
    userData.ph = hash(event.userData.phone);
  }
  if (event.userData.email) {
    userData.em = hash(event.userData.email);
  }

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime || Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: event.customData,
      },
    ],
    access_token: config.accessToken,
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${config.pixelId}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI error:', result);
    }

    return result;
  } catch (error) {
    console.error('Meta CAPI request failed:', error);
  }
}

export { generateEventId } from './event-id';

export function parseMetaCookies(cookieHeader?: string | null): { fbc?: string; fbp?: string } {
  if (!cookieHeader) return {};
  const cookies = cookieHeader.split('; ').reduce((acc, c) => {
    const [k, v] = c.split('=');
    if (k === '_fbc') acc.fbc = v;
    if (k === '_fbp') acc.fbp = v;
    return acc;
  }, {} as Record<string, string>);
  return cookies;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '0.0.0.0';
}
