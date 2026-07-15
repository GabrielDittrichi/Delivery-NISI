'use client'

import { useEffect } from 'react';
import { trackVisit } from '@/lib/analytics';
import { trackPixelAndCapi } from '@/lib/track-unified';

export default function AnalyticsTracker() {
  useEffect(() => {
    // Evitar rastreamento em desenvolvimento se desejar, mas útil para teste agora
    // if (process.env.NODE_ENV === 'development') return;

    const track = async () => {
      trackPixelAndCapi('PageView', {
        page_path: window.location.pathname,
        page_title: document.title,
      });

      // Prefer server-side tracking (no external client dependency).
      try {
        const payload = JSON.stringify({ referer: document.referrer });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
        } else {
          await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          });
        }
        return;
      } catch {
        // fall through
      }

      // Fallback: server action (still works, but depends on client execution).
      await trackVisit({
        userAgent: navigator.userAgent,
        referer: document.referrer,
      });
    };

    // Executar apenas uma vez por sessão (poderia usar sessionStorage para evitar duplicatas no refresh)
    const sessionKey = 'analytics_session_' + new Date().toISOString().split('T')[0];
    if (!sessionStorage.getItem(sessionKey)) {
        track();
        sessionStorage.setItem(sessionKey, 'true');
    }
  }, []);

  return null;
}
