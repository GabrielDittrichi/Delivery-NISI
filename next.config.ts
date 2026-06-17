function getImageHostFromEnv(envValue?: string) {
  if (!envValue) return null;
  try {
    const u = new URL(envValue);
    return u.hostname;
  } catch {
    return null;
  }
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,
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
