import { dirname } from 'path';
import { fileURLToPath } from 'url';

function getImageHostFromEnv(envValue?: string) {
  if (!envValue) return null;
  try {
    const u = new URL(envValue);
    return u.hostname;
  } catch {
    return null;
  }
}

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  poweredByHeader: false,
  reactCompiler: true,
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  images: (() => {
    const host = getImageHostFromEnv(process.env.R2_PUBLIC_URL);
    return host
      ? {
          remotePatterns: [{ protocol: "https", hostname: host }],
        }
      : {};
  })(),
};

export default nextConfig;
