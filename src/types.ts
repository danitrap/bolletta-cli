export type ProviderStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "canceled"
  | "unknown";

export type ProviderMatch = {
  provider: string;
  id: string;
  home: string;
  away: string;
  kickoffTime?: string; // ISO
  status: ProviderStatus;
  score?: { home: number | null; away: number | null };
  raw?: unknown;
  competition?: { id?: string; name?: string };
};

export interface MatchProvider {
  name: string;
  canUse(): boolean; // e.g., token present
  listMatchesByDate(dateISO: string, timeoutMs: number): Promise<ProviderMatch[]>;
}

export type ResolvedMatch = {
  provider: string;
  match: ProviderMatch | null;
  confidence: number; // 0..1
  reason?: string;
  error?: ResolveError;
};

export type BetStatus = "WIN" | "LOSE" | "PENDING" | "NOT_FOUND";

export type ResolveErrorCode = "NETWORK" | "TIMEOUT" | "HTTP" | "UNKNOWN";

export type ResolveError = {
  code: ResolveErrorCode;
  message: string;
  provider?: string;
};
