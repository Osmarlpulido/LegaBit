type Bucket = { count: number; resetAt: number };

export type NewsletterRateLimitOptions = {
  maxRequests: number;
  windowMs: number;
  maxKeys: number;
  now?: () => number;
};

/** A bounded, single-process fixed-window limiter for the public signup endpoint. */
export class NewsletterRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly now: () => number;

  constructor(private readonly options: NewsletterRateLimitOptions) {
    this.now = options.now ?? Date.now;
  }

  allow(key: string): boolean {
    const now = this.now();
    const current = this.buckets.get(key);
    if (current && current.resetAt > now) {
      current.count += 1;
      return current.count <= this.options.maxRequests;
    }
    if (current) this.buckets.delete(key);
    if (this.buckets.size >= this.options.maxKeys) {
      for (const [candidate, bucket] of this.buckets) {
        if (bucket.resetAt <= now) this.buckets.delete(candidate);
      }
      if (this.buckets.size >= this.options.maxKeys) {
        const oldest = this.buckets.keys().next().value as string | undefined;
        if (oldest) this.buckets.delete(oldest);
      }
    }
    this.buckets.set(key, { count: 1, resetAt: now + this.options.windowMs });
    return true;
  }
}
