type RateState = { count: number; resetAt: number };

// Basit bellek içi rate-limit: 20 istek / 10 dakika / IP
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 20;

const store = new Map<string, RateState>();

export function checkRateLimit(ip: string | null | undefined) {
  const key = ip || "unknown";
  const now = Date.now();
  let state = store.get(key);
  if (!state || now > state.resetAt) {
    state = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, state);
  }
  state.count += 1;
  const remaining = Math.max(0, LIMIT - state.count);
  const limited = state.count > LIMIT;
  return {
    limited,
    remaining,
    resetAt: state.resetAt,
  };
}


