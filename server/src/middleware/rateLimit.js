/**
 * Tiny in-memory rate limiter (no dependency). Protects the Gemini key from
 * being drained. Best-effort only: on serverless each instance has its own
 * counter. Swap for Redis / Upstash in production.
 */
export function rateLimit({ windowMs = 60_000, max = 30 } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'anon';
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }
    next();
  };
}
