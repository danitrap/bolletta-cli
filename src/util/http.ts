const DEFAULT_MAX_RETRIES = 3;

let currentCycleId = 0;
const cycleCache = new Map<string, Promise<any>>();

export function setCycleId(id: number) {
  if (id !== currentCycleId) {
    currentCycleId = id;
    cycleCache.clear();
  }
}

export type HttpOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxRetries?: number;
  cacheKey?: string; // enables per-cycle cache when provided
  method?: string;
};

export async function fetchJSON<T = any>(
  url: string,
  opts: HttpOptions = {}
): Promise<T> {
  const {
    headers = {},
    timeoutMs = 10000,
    maxRetries = DEFAULT_MAX_RETRIES,
    cacheKey,
    method = "GET",
  } = opts;

  const key = cacheKey ?? undefined;
  if (key) {
    const cached = cycleCache.get(key);
    if (cached) return cached as Promise<T>;
  }

  let attempt = 0;

  const run = async (): Promise<T> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { method, headers, signal: controller.signal });
      if (!res.ok) {
        const retryable = res.status === 429 || (res.status >= 500 && res.status < 600);
        if (retryable && attempt < maxRetries) {
          attempt++;
          const backoff = 300 * Math.pow(2, attempt - 1);
          await sleep(backoff);
          return run();
        }
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
      }
      const data = (await res.json()) as T;
      return data;
    } catch (err) {
      // AbortError or network errors
      if (attempt < maxRetries) {
        attempt++;
        const backoff = 300 * Math.pow(2, attempt - 1);
        await sleep(backoff);
        return run();
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };

  const p = run();
  if (key) cycleCache.set(key, p);
  return p;
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

