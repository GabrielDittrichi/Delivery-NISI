type TrackingPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: TrackingPayload[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const eventMap: Record<string, string> = {
  PageView: 'page_view',
  ViewContent: 'view_item',
  Search: 'search',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  AddPaymentInfo: 'add_payment_info',
  Purchase: 'purchase',
  ApplyCoupon: 'select_promotion',
  CouponApplied: 'select_promotion',
};

const metaStandardEvents = new Set([
  'PageView',
  'ViewContent',
  'Search',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
]);

export function trackMarketingEvent(eventName: string, payload: TrackingPayload = {}) {
  if (typeof window === 'undefined') return;
  const { eventID, ...eventPayload } = payload;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...payload,
  });

  if (window.gtag) {
    window.gtag('event', eventMap[eventName] || eventName, eventPayload);
  }

  if (window.fbq) {
    const method = metaStandardEvents.has(eventName) ? 'track' : 'trackCustom';
    const options = typeof eventID === 'string' ? { eventID } : undefined;
    window.fbq(method, eventName, eventPayload, options);
  }
}
