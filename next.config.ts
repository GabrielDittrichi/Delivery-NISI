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
  reactCompiler: true,
  turbopack: {
    root: projectRoot,
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
