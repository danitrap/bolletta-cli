import type { ResolveError } from "../types";

export function classifyError(err: unknown, provider?: string): ResolveError {
  const message = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : undefined;

  if (name === "AbortError" || /timeout/i.test(message)) {
    return { code: "TIMEOUT", message, provider };
  }
  if (/^HTTP\s+\d+/.test(message)) {
    return { code: "HTTP", message, provider };
  }
  if (/network|fetch/i.test(message)) {
    return { code: "NETWORK", message, provider };
  }
  return { code: "UNKNOWN", message, provider };
}
