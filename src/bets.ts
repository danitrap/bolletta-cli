import type { BetStatus, ProviderMatch } from "./types";
import type { BetType, ConfigPick } from "./betTypes";
import config from "../schedina.config";

export type Score = { home: number; away: number };

function isScoreComplete(score?: { home: number | null; away: number | null } | null): score is Score {
  return !!score && score.home != null && score.away != null;
}

export function evalX2(score: Score): boolean {
  return score.away >= score.home;
}

export function evalUnder35(score: Score): boolean {
  return score.home + score.away <= 3;
}

export function evalX2Under35(score: Score): boolean {
  return evalX2(score) && evalUnder35(score);
}

export function evalGG(score: Score): boolean {
  return score.home >= 1 && score.away >= 1;
}

export function eval12(score: Score): boolean {
  return score.home !== score.away;
}

export function evalOver25(score: Score): boolean {
  return score.home + score.away >= 3;
}

export function eval1(score: Score): boolean {
  return score.home > score.away;
}

export function eval1X(score: Score): boolean {
  return score.home >= score.away;
}

export function eval2(score: Score): boolean {
  return score.away > score.home;
}

export function evalUnder25(score: Score): boolean {
  return score.home + score.away <= 2;
}

export function evalX2Over25(score: Score): boolean {
  return evalX2(score) && evalOver25(score);
}

export type BetKind =
  | { kind: "X2Under35"; label: "X2 + Under 3.5"; eval: typeof evalX2Under35 }
  | { kind: "GG"; label: "GG"; eval: typeof evalGG }
  | { kind: "12"; label: "12"; eval: typeof eval12 }
  | { kind: "Over25"; label: "Over 2.5"; eval: typeof evalOver25 }
  | { kind: "1"; label: "1"; eval: typeof eval1 }
  | { kind: "X2"; label: "X2"; eval: typeof evalX2 }
  | { kind: "1X"; label: "1X"; eval: typeof eval1X }
  | { kind: "2"; label: "2"; eval: typeof eval2 }
  | { kind: "Under25"; label: "Under 2.5"; eval: typeof evalUnder25 }
  | { kind: "X2Over25"; label: "X2 + Over 2.5"; eval: typeof evalX2Over25 };

export type Pick = {
  home: string;
  away: string;
  bet: BetKind;
};

const betMap: Record<BetType, { label: string; eval: (s: Score) => boolean }> = {
  X2Under35: { label: "X2 + Under 3.5", eval: evalX2Under35 },
  GG: { label: "GG", eval: evalGG },
  "12": { label: "12", eval: eval12 },
  Over25: { label: "Over 2.5", eval: evalOver25 },
  "1": { label: "1", eval: eval1 },
  X2: { label: "X2", eval: evalX2 },
  "1X": { label: "1X", eval: eval1X },
  "2": { label: "2", eval: eval2 },
  Under25: { label: "Under 2.5", eval: evalUnder25 },
  X2Over25: { label: "X2 + Over 2.5", eval: evalX2Over25 },
};

function toRuntimePick(p: ConfigPick): Pick {
  const def = betMap[p.bet];
  return {
    home: p.home,
    away: p.away,
    bet: { kind: p.bet, label: def.label as BetKind["label"], eval: def.eval as any },
  };
}

export const schedina: Pick[] = config.map(toRuntimePick);

export function computeOutcome(pick: Pick, match: ProviderMatch | null): {
  betStatus: BetStatus;
  reason: string;
} {
  if (!match) return { betStatus: "NOT_FOUND", reason: "NOT_FOUND" };
  if (match.status !== "finished") {
    if (match.status === "postponed" || match.status === "canceled")
      return { betStatus: "PENDING", reason: "POSTPONED/CANCELED" };
    if (match.status === "live") return { betStatus: "PENDING", reason: "LIVE" };
    return { betStatus: "PENDING", reason: match.status.toUpperCase() };
  }
  if (!isScoreComplete(match.score)) return { betStatus: "PENDING", reason: "NO_SCORE" };
  const s = match.score as Score;
  const ok = pick.bet.eval(s);
  return { betStatus: ok ? "WIN" : "LOSE", reason: "FINISHED" };
}
