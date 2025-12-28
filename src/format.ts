import { fmtKickoff, fmtScore } from "./domain/formatters";
import { computeProgress } from "./domain/progress";
import type { RowData } from "./domain/row";
import { translateBetStatus, translateMatchStatus, translateReason } from "./presentation/statusLabels";
import { t } from "./presentation/i18n";
import type { BetType } from "./betTypes";

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

function formatMatch(row: RowData): string {
  return `${row.home} - ${row.away}`;
}

function betLabelFor(bet: BetType | undefined, fallback?: string): string {
  if (!bet) return fallback || "";
  return t(`bets.${bet}`);
}

function cellValue(key: HeaderKey, row: RowData, timezone: string, lang: string): string {
  switch (key) {
    case "MATCH":
      return formatMatch(row);
    case "KICKOFF":
      return fmtKickoff(row.kickoffTime, timezone, lang);
    case "SCORE":
      return fmtScore(row.score);
    case "MATCH_STATUS":
      return translateMatchStatus(String(row.matchStatus));
    case "BET_STATUS":
      return translateBetStatus(row.betStatus);
    case "BET":
      return betLabelFor(row.betKind, row.betLabel);
    case "REASON":
      return translateReason(row.reason);
    case "PROGRESS":
      return computeProgress(row);
    case "PROVIDER":
      return row.provider;
    default:
      return "";
  }
}

function measureTable(
  rows: RowData[],
  timezone: string,
  lang: string
): { widths: Map<string, number>; matrix: string[][]; headers: Array<{ key: HeaderKey; label: string }> } {
  const widths = new Map<string, number>();
  const headers = getTableHeaders();
  for (const h of headers) widths.set(h.key, h.label.length);
  const matrix: string[][] = [];
  for (const r of rows) {
    const rowVals: string[] = [];
    for (const h of headers) {
      const v = cellValue(h.key, r, timezone, lang);
      rowVals.push(v);
      widths.set(h.key, Math.max(widths.get(h.key) || 0, v.length));
    }
    matrix.push(rowVals);
  }
  return { widths, matrix, headers };
}

export function formatTable(rows: RowData[], timezone: string, lang: string): string {
  const { widths, matrix, headers } = measureTable(rows, timezone, lang);
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

export function toJSON(rows: RowData[], timezone: string, lang: string) {
  return rows.map((row) => {
    const [reasonPrefix, reasonCode] = String(row.reason).split(":", 2);
    const code =
      row.errorCode || (reasonPrefix === "ERROR" ? reasonCode || "UNKNOWN" : undefined) || undefined;
    const error =
      code || row.errorMessage || row.errorProvider
        ? {
            code: code || "UNKNOWN",
            message: row.errorMessage,
            provider: row.errorProvider,
          }
        : undefined;
    return {
      MATCH: formatMatch(row),
      KICKOFF: fmtKickoff(row.kickoffTime, timezone, lang),
      SCORE: fmtScore(row.score),
      MATCH_STATUS: row.matchStatus,
      BET: row.betKind || row.betLabel,
      BET_STATUS: row.betStatus,
      REASON: row.reason,
      PROVIDER: row.provider,
      error,
    };
  });
}

export function buildTableModel(rows: RowData[], timezone: string, lang: string): {
  headers: Array<{ key: HeaderKey; label: string; width: number }>;
  rows: string[][];
} {
  const { widths, matrix, headers } = measureTable(rows, timezone, lang);
  const headersWithWidth = headers.map((h) => ({ key: h.key, label: h.label, width: widths.get(h.key) || h.label.length }));
  return { headers: headersWithWidth, rows: matrix };
}
