import type { BetType } from "./betTypes";
import { computeProgress } from "./domain/progress";
import { translateBetStatus, translateMatchStatus, translateReason } from "./presentation/statusLabels";

export type ScoreValue = { home: number | null; away: number | null };

export type Row = {
  MATCH: string;
  KICKOFF: string;
  SCORE: string;
  MATCH_STATUS: string;
  BET: string;
  BET_KIND?: BetType;
  BET_STATUS: BetStatus;
  REASON: string;
  PROVIDER: string;
  SCORE_VALUE?: ScoreValue | null;
  COMPETITION?: string;
  ERROR_CODE?: string;
  ERROR_MESSAGE?: string;
  ERROR_PROVIDER?: string;
};

export const tableHeaders = [
  { key: "MATCH", label: "Partita" },
  { key: "KICKOFF", label: "Inizio" },
  { key: "SCORE", label: "Punteggio" },
  { key: "MATCH_STATUS", label: "Stato" },
  { key: "BET", label: "Scommessa" },
  { key: "BET_STATUS", label: "Esito" },
  { key: "REASON", label: "Motivo" },
  { key: "PROGRESS", label: "Andamento" },
  { key: "PROVIDER", label: "Fonte" },
] as const;

type HeaderKey = (typeof tableHeaders)[number]["key"];

function cellValue(key: HeaderKey, row: Row): string {
  switch (key) {
    case "MATCH_STATUS":
      return translateMatchStatus(String(row.MATCH_STATUS));
    case "BET_STATUS":
      return translateBetStatus(row.BET_STATUS);
    case "REASON":
      return translateReason(row.REASON);
    case "PROGRESS":
      return computeProgress(row);
    default:
      return String((row as any)[key]);
  }
}

function measureTable(rows: Row[]): { widths: Map<string, number>; matrix: string[][] } {
  const widths = new Map<string, number>();
  for (const h of tableHeaders) widths.set(h.key, h.label.length);
  const matrix: string[][] = [];
  for (const r of rows) {
    const rowVals: string[] = [];
    for (const h of tableHeaders) {
      const v = cellValue(h.key, r);
      rowVals.push(v);
      widths.set(h.key, Math.max(widths.get(h.key) || 0, v.length));
    }
    matrix.push(rowVals);
  }
  return { widths, matrix };
}

export function formatTable(rows: Row[]): string {
  const { widths, matrix } = measureTable(rows);
  const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
  const sep = " | ";
  const headerLine = tableHeaders.map((h) => pad(h.label, widths.get(h.key) || h.label.length)).join(sep);
  const line = tableHeaders
    .map((h) => "".padEnd(widths.get(h.key) || h.label.length, "-"))
    .join("-+-");
  const body = matrix
    .map((rowVals) => tableHeaders.map((h, i) => pad(rowVals[i], widths.get(h.key) || h.label.length)).join(sep))
    .join("\n");
  return `${headerLine}\n${line}\n${body}`;
}

export function toJSON(rows: Row[]) {
  return rows.map(({ COMPETITION, BET_KIND, SCORE_VALUE, ERROR_CODE, ERROR_MESSAGE, ERROR_PROVIDER, ...rest }) => {
    const [reasonPrefix, reasonCode] = String(rest.REASON).split(":", 2);
    const code =
      ERROR_CODE || (reasonPrefix === "ERROR" ? reasonCode || "UNKNOWN" : undefined) || undefined;
    const error =
      code || ERROR_MESSAGE || ERROR_PROVIDER
        ? {
            code: code || "UNKNOWN",
            message: ERROR_MESSAGE,
            provider: ERROR_PROVIDER,
          }
        : undefined;
    return { ...rest, error };
  });
}

export function buildTableModel(rows: Row[]): {
  headers: Array<{ key: HeaderKey; label: string; width: number }>;
  rows: string[][];
} {
  const { widths, matrix } = measureTable(rows);
  const headers = tableHeaders.map((h) => ({ key: h.key, label: h.label, width: widths.get(h.key) || h.label.length }));
  return { headers, rows: matrix };
}
