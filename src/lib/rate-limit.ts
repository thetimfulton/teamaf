/* ──────────────────────────────────────────────
   Simple in-memory rate limiter
   Resets on cold-start — fine for a wedding site
   ────────────────────────────────────────────── */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

/**
 * Check rate limit for a given key (e.g., IP address).
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}
