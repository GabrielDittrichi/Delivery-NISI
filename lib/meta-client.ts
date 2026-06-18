export function getMetaCookies(): { fbc?: string; fbp?: string } {
  if (typeof document === 'undefined') return {};
  const cookies = document.cookie.split('; ').reduce((acc, c) => {
    const [k, v] = c.split('=');
    if (k === '_fbc') acc.fbc = v;
    if (k === '_fbp') acc.fbp = v;
    return acc;
  }, {} as Record<string, string>);
  return cookies;
}

export function getMetaUserData(): {
  clientUserAgent: string;
  fbc?: string;
  fbp?: string;
} {
  const cookies = getMetaCookies();
  return {
    clientUserAgent: navigator.userAgent,
    fbc: cookies.fbc,
    fbp: cookies.fbp,
  };
}
