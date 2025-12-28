import type { ProviderStatus } from "../types";

export type MatchStatusCode =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "LIVE"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "CANCELED"
  | "AWARDED"
  | "ABANDONED"
  | "NOT_FOUND"
  | "ERROR"
  | "UNKNOWN";

export type ReasonCode = MatchStatusCode | "NO_SCORE" | "POSTPONED/CANCELED";

export function matchStatusCodeFromProvider(status: ProviderStatus): MatchStatusCode {
  switch (status) {
    case "scheduled":
      return "SCHEDULED";
    case "live":
      return "LIVE";
    case "finished":
      return "FINISHED";
    case "postponed":
      return "POSTPONED";
    case "canceled":
      return "CANCELED";
    case "unknown":
    default:
      return "UNKNOWN";
  }
}

export function reasonFromProviderStatus(status: ProviderStatus): ReasonCode {
  switch (status) {
    case "postponed":
    case "canceled":
      return "POSTPONED/CANCELED";
    case "live":
      return "LIVE";
    case "scheduled":
      return "SCHEDULED";
    case "finished":
      return "FINISHED";
    case "unknown":
    default:
      return "UNKNOWN";
  }
}

export function makeReason(code: ReasonCode, errorCode?: string): string {
  if (code === "ERROR") return `ERROR:${errorCode || "UNKNOWN"}`;
  return code;
}

export function parseReason(reason: string): { code: ReasonCode | "UNKNOWN"; errorCode?: string } {
  const upper = reason.toUpperCase();
  if (upper.startsWith("ERROR")) {
    const code = reason.split(":", 2)[1] || "UNKNOWN";
    return { code: "ERROR", errorCode: code };
  }
  return { code: upper as ReasonCode };
}
