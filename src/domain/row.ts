import type { BetType } from "../betTypes";
import type { BetStatus } from "../types";

export type ScoreValue = { home: number | null; away: number | null };

export type RowData = {
  home: string;
  away: string;
  kickoffTime?: string;
  score?: ScoreValue | null;
  matchStatus: string;
  betLabel: string;
  betKind?: BetType;
  betStatus: BetStatus;
  reason: string;
  provider: string;
  competition?: string;
  errorCode?: string;
  errorMessage?: string;
  errorProvider?: string;
};
