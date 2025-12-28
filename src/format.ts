import type { BetType } from "./betTypes";
import type { BetStatus } from "./types";
import { computeProgress } from "./domain/progress";
import { translateBetStatus, translateMatchStatus, translateReason } from "./presentation/statusLabels";
import { t } from "./presentation/i18n";

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

export const tableHeaderKeys = [
  "MATCH",
  "KICKOFF",
  "SCORE",
  "MATCH_STATUS",
  "BET",
  "BET_STATUS",
  "REASON",
  "PROGRESS",
  "PROVIDER",
] as const;

export type HeaderKey = (typeof tableHeaderKeys)[number];

export function getTableHeaders(): Array<{ key: HeaderKey; label: string }> {
  return tableHeaderKeys.map((key) => ({ key, label: t(`headers.${key}`) }));
}

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

function measureTable(rows: Row[]): { widths: Map<string, number>; matrix: string[][]; headers: Array<{ key: HeaderKey; label: string }> } {
  const widths = new Map<string, number>();
  const headers = getTableHeaders();
  for (const h of headers) widths.set(h.key, h.label.length);
  const matrix: string[][] = [];
  for (const r of rows) {
    const rowVals: string[] = [];
    for (const h of headers) {
      const v = cellValue(h.key, r);
      rowVals.push(v);
      widths.set(h.key, Math.max(widths.get(h.key) || 0, v.length));
    }
    matrix.push(rowVals);
  }
  return { widths, matrix, headers };
}

export function formatTable(rows: Row[]): string {
  const { widths, matrix, headers } = measureTable(rows);
  const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
  const sep = " | ";
  const headerLine = headers.map((h) => pad(h.label, widths.get(h.key) || h.label.length)).join(sep);
  const line = headers
    .map((h) => "".padEnd(widths.get(h.key) || h.label.length, "-"))
    .join("-+-");
  const body = matrix
    .map((rowVals) => headers.map((h, i) => pad(rowVals[i], widths.get(h.key) || h.label.length)).join(sep))
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
  const { widths, matrix, headers } = measureTable(rows);
  const headersWithWidth = headers.map((h) => ({ key: h.key, label: h.label, width: widths.get(h.key) || h.label.length }));
  return { headers: headersWithWidth, rows: matrix };
}
