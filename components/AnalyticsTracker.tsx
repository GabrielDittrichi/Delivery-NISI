'use client'

import { useEffect } from 'react';
import { trackVisit } from '@/lib/analytics';

export default function AnalyticsTracker() {
  useEffect(() => {
    // Evitar rastreamento em desenvolvimento se desejar, mas útil para teste agora
    // if (process.env.NODE_ENV === 'development') return;

    const track = async () => {
      // Tentar obter dados básicos de localização via API pública gratuita (opcional)
      // Se falhar, segue sem localização
      let locationData = { city: undefined, country: undefined };
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            const data = await res.json();
            locationData = { city: data.city, country: data.country_name };
        }
      } catch (e) {
        // Ignorar erro de fetch de localização
      }

      await trackVisit({
        userAgent: navigator.userAgent,
        referer: document.referrer,
        city: locationData.city,
        country: locationData.country
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
