export type BetType =
  | "X2Under35"
  | "GG"
  | "12"
  | "Over25"
  | "1"
  | "X2"
  | "1X"
  | "2"
  | "Under25"
  | "X2Over25";

export type ConfigPick = {
  home: string;
  away: string;
  bet: BetType;
};
