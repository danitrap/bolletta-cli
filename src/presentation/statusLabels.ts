import type { BetStatus } from "../types";
import { t } from "./i18n";

export function translateMatchStatus(s: string): string {
  switch (s.toUpperCase()) {
    case "SCHEDULED":
    case "TIMED":
      return t("status.match.scheduled");
    case "IN_PLAY":
    case "LIVE":
      return t("status.match.live");
    case "PAUSED":
      return t("status.match.paused");
    case "FINISHED":
      return t("status.match.finished");
    case "SUSPENDED":
      return t("status.match.suspended");
    case "POSTPONED":
      return t("status.match.postponed");
    case "CANCELLED":
    case "CANCELED":
      return t("status.match.cancelled");
    case "AWARDED":
      return t("status.match.awarded");
    case "ABANDONED":
      return t("status.match.abandoned");
    case "NOT_FOUND":
      return t("status.match.notFound");
    case "ERROR":
      return t("status.match.error");
    default:
      return s;
  }
}

export function translateBetStatus(s: BetStatus): string {
  switch (s) {
    case "WIN":
      return t("status.bet.win");
    case "LOSE":
      return t("status.bet.lose");
    case "PENDING":
      return t("status.bet.pending");
    case "NOT_FOUND":
      return t("status.bet.notFound");
  }
}

export function translateReason(s: string): string {
  const upper = s.toUpperCase();
  if (upper.startsWith("ERROR")) return t("reason.error");
  switch (upper) {
    case "FINISHED":
      return t("reason.finished");
    case "NO_SCORE":
      return t("reason.noScore");
    case "POSTPONED/CANCELED":
      return t("reason.postponedCanceled");
    case "LIVE":
      return t("reason.live");
    case "NOT_FOUND":
      return t("reason.notFound");
    default:
      return translateMatchStatus(s);
  }
}
