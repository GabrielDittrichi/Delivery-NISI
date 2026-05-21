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
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
  ApplyCoupon: 'select_promotion',
};

export function trackMarketingEvent(eventName: string, payload: TrackingPayload = {}) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...payload,
  });

  if (window.gtag) {
    window.gtag('event', eventMap[eventName] || eventName, payload);
  }

  if (window.fbq) {
    window.fbq('track', eventName, payload);
  }
}
