import type { ProviderStatus } from "../types";

export function mapFootballDataStatus(s: string): ProviderStatus {
  switch (s) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "SCHEDULED":
    case "TIMED":
      return "scheduled";
    case "POSTPONED":
      return "postponed";
    case "CANCELED":
      return "canceled";
    case "SUSPENDED":
      return "live";
    default:
      return "unknown";
  }
}

export function mapTheSportsDbStatus(s?: string | null): ProviderStatus {
  const v = (s || "").toLowerCase();
  if (!v) return "unknown";
  if (v.includes("finished") || v.includes("ft")) return "finished";
  if (v.includes("postponed")) return "postponed";
  if (v.includes("canceled") || v.includes("cancelled")) return "canceled";
  if (v.includes("live") || v.includes("in play") || v.includes("1h") || v.includes("2h")) return "live";
  if (v.includes("scheduled") || v.includes("not started") || v.includes("timed")) return "scheduled";
  return "unknown";
}
