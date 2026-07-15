import { trackMarketingEvent } from './tracking';
import { generateEventId } from './event-id';

export function trackPixelAndCapi(
  eventName: string,
  customData?: Record<string, unknown>,
  eventId?: string,
  userData?: Record<string, unknown>,
) {
  const id = eventId || generateEventId();

  // 1. Browser Pixel (pode ser bloqueado por adblock)
  trackMarketingEvent(eventName, { ...customData, eventID: id });

  // 2. CAPI via servidor (passa por proxy, captura IP real, nunca bloqueado)
  fetch('/api/meta-track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId: id,
      userData,
      customData: {
        ...customData,
        eventID: undefined, // remove eventID duplicado
      },
    }),
    keepalive: true,
  }).catch(() => {});
}
