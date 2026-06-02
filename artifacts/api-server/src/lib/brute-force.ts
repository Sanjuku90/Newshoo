interface Attempt { count: number; firstAt: number; blockedUntil?: number; }
const store = new Map<string, Attempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

export function checkBruteForce(ip: string): { blocked: boolean; remainingMs?: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { blocked: true, remainingMs: entry.blockedUntil - now };
  }

  if (entry && now - entry.firstAt > WINDOW_MS) {
    store.delete(ip);
  }

  return { blocked: false };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    store.set(ip, { count: 1, firstAt: now });
    return;
  }

  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS;
  }
  store.set(ip, entry);
}

export function clearAttempts(ip: string): void {
  store.delete(ip);
}
