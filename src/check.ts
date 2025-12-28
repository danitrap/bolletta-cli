import { schedina, computeOutcome } from "./bets";
import { resolveMatch } from "./matchResolver";
import type { Row } from "./format";

function fdCompetitionName(id?: string): string | undefined {
  switch (String(id || "")) {
    case "2001":
      return "Champions League";
    case "2002":
      return "Bundesliga";
    case "2014":
      return "La Liga";
    case "2015":
      return "Ligue 1";
    case "2019":
      return "Serie A";
    case "2021":
      return "Premier League";
    default:
      return id ? `Competizione ${id}` : undefined;
  }
}

export function fmtKickoff(iso: string | undefined, tz: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("it-IT", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return fmt.format(d);
}

export function fmtScore(
  s?: { home: number | null; away: number | null } | null,
  status?: string
): string {
  if (s && s.home != null && s.away != null) return `${s.home}-${s.away}`;
  const st = (status || "").toLowerCase();
  if (st === "scheduled" || st === "live") return "0-0";
  return "-";
}

export async function checkOnce(
  dateISO: string,
  tz: string,
  timeoutMs: number,
  verbose: boolean,
  dateWindow: number
) {
  const results = await Promise.all(
    schedina.map(async (pick) => {
      const resolved = await resolveMatch(pick.home, pick.away, dateISO, {
        timeoutMs,
        verbose,
        dateWindow,
      });
      const outcome = computeOutcome(pick, resolved.match);
      const compLabel =
        resolved.match?.competition?.name ||
        (resolved.provider === "football-data" ? fdCompetitionName(resolved.match?.competition?.id) : undefined) ||
        (resolved.provider === "thesportsdb" ? "TheSportsDB" : undefined) ||
        resolved.provider;
      const row: Row = {
        MATCH: `${pick.home} - ${pick.away}`,
        KICKOFF: fmtKickoff(resolved.match?.kickoffTime, tz),
        SCORE: fmtScore(resolved.match?.score, resolved.match?.status),
        MATCH_STATUS: resolved.match?.status.toUpperCase() ?? "NOT_FOUND",
        BET: pick.bet.label,
        BET_STATUS: outcome.betStatus,
        REASON: outcome.reason,
        PROVIDER: resolved.provider,
        // non visual, usato per i raggruppamenti in UI
        // @ts-ignore
        COMPETITION: compLabel,
      };
      return row;
    })
  );
  const allDone = results.every(
    (r) => r.BET_STATUS === "WIN" || r.BET_STATUS === "LOSE" || r.BET_STATUS === "NOT_FOUND"
  );
  return { results, allDone };
}
