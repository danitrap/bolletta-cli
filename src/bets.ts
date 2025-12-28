import type { BetStatus, ProviderMatch } from "./types";
import type { BetType, ConfigPick } from "./betTypes";
import { makeReason, reasonFromProviderStatus } from "./domain/codes";
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
  | { kind: "X2Under35"; label: string; eval: typeof evalX2Under35 }
  | { kind: "GG"; label: string; eval: typeof evalGG }
  | { kind: "12"; label: string; eval: typeof eval12 }
  | { kind: "Over25"; label: string; eval: typeof evalOver25 }
  | { kind: "1"; label: string; eval: typeof eval1 }
  | { kind: "X2"; label: string; eval: typeof evalX2 }
  | { kind: "1X"; label: string; eval: typeof eval1X }
  | { kind: "2"; label: string; eval: typeof eval2 }
  | { kind: "Under25"; label: string; eval: typeof evalUnder25 }
  | { kind: "X2Over25"; label: string; eval: typeof evalX2Over25 };

export type Pick = {
  home: string;
  away: string;
  bet: BetKind;
};

const betMap: Record<BetType, { eval: (s: Score) => boolean }> = {
  X2Under35: { eval: evalX2Under35 },
  GG: { eval: evalGG },
  "12": { eval: eval12 },
  Over25: { eval: evalOver25 },
  "1": { eval: eval1 },
  X2: { eval: evalX2 },
  "1X": { eval: eval1X },
  "2": { eval: eval2 },
  Under25: { eval: evalUnder25 },
  X2Over25: { eval: evalX2Over25 },
};

function toRuntimePick(p: ConfigPick): Pick {
  const def = betMap[p.bet];
  return {
    home: p.home,
    away: p.away,
    bet: { kind: p.bet, label: p.bet, eval: def.eval as any },
  };
}

export const schedina: Pick[] = config.map(toRuntimePick);

export function computeOutcome(pick: Pick, match: ProviderMatch | null): {
  betStatus: BetStatus;
  reason: string;
} {
  if (!match) return { betStatus: "NOT_FOUND", reason: makeReason("NOT_FOUND") };
  if (match.status !== "finished") {
    if (match.status === "postponed" || match.status === "canceled")
      return { betStatus: "PENDING", reason: makeReason("POSTPONED/CANCELED") };
    return { betStatus: "PENDING", reason: makeReason(reasonFromProviderStatus(match.status)) };
  }
  if (!isScoreComplete(match.score)) return { betStatus: "PENDING", reason: makeReason("NO_SCORE") };
  const s = match.score as Score;
  const ok = pick.bet.eval(s);
  return { betStatus: ok ? "WIN" : "LOSE", reason: makeReason("FINISHED") };
}
