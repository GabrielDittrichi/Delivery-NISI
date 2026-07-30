type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function getRequestIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
}

export function isRateLimited(req: Request, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucketKey = `${key}:${getRequestIp(req)}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > limit;
}

export function isJsonTooLarge(req: Request, maxBytes: number) {
  const length = Number(req.headers.get('content-length') || 0);
  return Number.isFinite(length) && length > maxBytes;
}
