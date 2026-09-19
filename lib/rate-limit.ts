// Simple in-memory sliding-window rate limiter (V1, no vendor).
// Protects public write endpoints from spam. NOT shared across instances —
// acceptable for V1 traffic; graduate to Redis/Upstash when multi-instance
// abuse or legitimate throttling becomes visible in PostHog.

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

function now(): number {
  return Date.now();
}

function prune(bucket: Bucket, windowStart: number): void {
  while (bucket.hits.length > 0 && bucket.hits[0] < windowStart) {
    bucket.hits.shift();
  }
}

export function checkRateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): { ok: boolean; remaining: number; resetMs: number } {
  const t = now();
  const windowStart = t - opts.windowMs;
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  prune(bucket, windowStart);
  if (bucket.hits.length >= opts.limit) {
    return { ok: false, remaining: 0, resetMs: bucket.hits[0] + opts.windowMs - t };
  }
  bucket.hits.push(t);
  // Opportunistic cleanup so idle keys don't leak memory.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      prune(b, windowStart);
      if (b.hits.length === 0) buckets.delete(k);
      if (buckets.size <= 5_000) break;
    }
  }
  return { ok: true, remaining: opts.limit - bucket.hits.length, resetMs: opts.windowMs };
}

/** Best-effort client IP behind Vercel/proxies. Never logged, only used as a throttle key. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}
