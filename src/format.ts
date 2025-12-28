import type { BetStatus } from "./types";

export type Row = {
  MATCH: string;
  KICKOFF: string;
  SCORE: string;
  MATCH_STATUS: string;
  BET: string;
  BET_STATUS: BetStatus;
  REASON: string;
  PROVIDER: string;
};

export const tableHeaders = [
  { key: "MATCH", label: "Partita" },
  { key: "KICKOFF", label: "Inizio" },
  { key: "SCORE", label: "Punteggio" },
  { key: "MATCH_STATUS", label: "Stato" },
  { key: "BET", label: "Scommessa" },
  { key: "BET_STATUS", label: "Esito" },
  { key: "PROGRESS", label: "Andamento" },
  { key: "PROVIDER", label: "Fonte" },
] as const;

export function translateMatchStatus(s: string): string {
  switch (s.toUpperCase()) {
    case "SCHEDULED":
    case "TIMED":
      return "Programmata";
    case "IN_PLAY":
    case "LIVE":
      return "In corso";
    case "PAUSED":
      return "Intervallo";
    case "FINISHED":
      return "Finita";
    case "SUSPENDED":
      return "Sospesa";
    case "POSTPONED":
      return "Rinviata";
    case "CANCELLED":
    case "CANCELED":
      return "Annullata";
    case "AWARDED":
      return "Omologata";
    case "ABANDONED":
      return "Abbandonata";
    case "NOT_FOUND":
      return "Non trovata";
    default:
      return s;
  }
}

export function translateBetStatus(s: BetStatus): string {
  switch (s) {
    case "WIN":
      return "Vinta";
    case "LOSE":
      return "Persa";
    case "PENDING":
      return "In corso";
    case "NOT_FOUND":
      return "Non trovata";
  }
}

export function translateReason(s: string): string {
  switch (s.toUpperCase()) {
    case "FINISHED":
      return "Finita";
    case "NO_SCORE":
      return "Senza risultato";
    case "POSTPONED/CANCELED":
      return "Rinviata/Annullata";
    case "LIVE":
      return "In corso";
    case "NOT_FOUND":
      return "Non trovata";
    default:
      return translateMatchStatus(s);
  }
}

export function formatTable(rows: Row[]): string {
  const widths = new Map<string, number>();
  for (const h of tableHeaders) widths.set(h.key, h.label.length);
  const cell = (k: (typeof tableHeaders)[number]["key"], v: unknown, r?: Row): string => {
    switch (k) {
      case "MATCH_STATUS":
        return translateMatchStatus(String(v));
      case "BET_STATUS":
        return translateBetStatus(v as BetStatus);
      case "PROGRESS":
        return computeProgress(r!);
      default:
        return String(v);
    }
  };
  for (const r of rows) {
    for (const h of tableHeaders) {
      const v = cell(h.key, (r as any)[h.key], r);
      widths.set(h.key, Math.max(widths.get(h.key) || 0, v.length));
    }
  }
  const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
  const sep = " | ";
  const headerLine = tableHeaders.map((h) => pad(h.label, widths.get(h.key) || h.label.length)).join(sep);
  const line = tableHeaders
    .map((h) => "".padEnd(widths.get(h.key) || h.label.length, "-"))
    .join("-+-");
  const body = rows
    .map((r) => tableHeaders.map((h) => pad(cell(h.key, (r as any)[h.key], r), widths.get(h.key) || h.label.length)).join(sep))
    .join("\n");
  return `${headerLine}\n${line}\n${body}`;
}

export function toJSON(rows: Row[]) {
  return rows;
}

export function buildTableModel(rows: Row[]): {
  headers: Array<{ key: (typeof tableHeaders)[number]["key"]; label: string; width: number }>;
  rows: string[][];
} {
  const widths = new Map<string, number>();
  for (const h of tableHeaders) widths.set(h.key, h.label.length);
  const cell = (k: (typeof tableHeaders)[number]["key"], v: unknown, r?: Row): string => {
    switch (k) {
      case "MATCH_STATUS":
        return translateMatchStatus(String(v));
      case "BET_STATUS":
        return translateBetStatus(v as BetStatus);
      case "PROGRESS":
        return computeProgress(r!);
      default:
        return String(v);
    }
  };
  const matrix: string[][] = [];
  for (const r of rows) {
    const rowVals: string[] = [];
    for (const h of tableHeaders) {
      const v = cell(h.key, (r as any)[h.key], r);
      rowVals.push(v);
      widths.set(h.key, Math.max(widths.get(h.key) || 0, v.length));
    }
    matrix.push(rowVals);
  }
  const headers = tableHeaders.map((h) => ({ key: h.key, label: h.label, width: widths.get(h.key) || h.label.length }));
  return { headers, rows: matrix };
}

function parseScoreStr(s: string): { home: number; away: number } | null {
  const m = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(s);
  if (!m) return null;
  return { home: Number(m[1]), away: Number(m[2]) };
}

export function computeProgress(r: Row): string {
  // Finished: align with Esito
  if (r.BET_STATUS === "WIN") return "Vinta";
  if (r.BET_STATUS === "LOSE") return "Persa";
  if (r.BET_STATUS === "NOT_FOUND") return "Non trovata";

  const score = parseScoreStr(r.SCORE);
  if (!score) return "In attesa di punteggio";

  const { home, away } = score;
  const sum = home + away;
  const bet = r.BET.toLowerCase();

  if (bet.includes("x2") && bet.includes("under") && /3\.5/.test(bet)) {
    const x2 = away >= home;
    const under = sum <= 3;
    if (x2 && under) return "Vincente al momento";
    const parts: string[] = [];
    if (!x2) parts.push("X2");
    if (!under) parts.push("Under 3.5");
    return `Manca: ${parts.join(" e ")}`;
  }

  if (bet.includes("x2") && bet.includes("over") && /2\.5/.test(bet)) {
    const x2 = away >= home;
    const over = sum >= 3;
    if (x2 && over) return "Vincente al momento";
    const parts: string[] = [];
    if (!x2) parts.push("X2");
    if (!over) parts.push("Over 2.5");
    return `Manca: ${parts.join(" e ")}`;
  }

  if (bet === "gg") {
    const hg = home >= 1;
    const ag = away >= 1;
    if (hg && ag) return "Vincente al momento";
    if (!hg && !ag) return "Mancano 2 gol (uno per squadra)";
    if (!hg) return "Manca: gol casa";
    if (!ag) return "Manca: gol ospiti";
  }

  if (bet === "12") {
    if (home !== away) return "Vincente al momento";
    return "Manca: sblocco pareggio";
  }

  if (bet.includes("over") && /2\.5/.test(bet)) {
    if (sum >= 3) return "Vincente al momento";
    const need = 3 - sum;
    return need === 1 ? "Manca: 1 gol" : `Mancano: ${need} gol`;
  }

  if (bet === "1") {
    if (home > away) return "Vincente al momento";
    if (home === away) return "Manca: vantaggio casa";
    return "Manca: rimonta casa";
  }

  if (bet === "1x") {
    if (home >= away) return "Vincente al momento";
    return "Manca: pareggio o vantaggio casa";
  }

  if (bet === "x2") {
    if (away >= home) return "Vincente al momento";
    return "Manca: pareggio o vantaggio ospiti";
  }

  if (bet === "2") {
    if (away > home) return "Vincente al momento";
    if (home === away) return "Manca: vantaggio ospiti";
    return "Manca: rimonta ospiti";
  }

  if (bet.includes("under") && /2\.5/.test(bet)) {
    if (sum <= 2) return "Vincente al momento";
    return "Soglia superata";
  }

  return "In corso";
}
