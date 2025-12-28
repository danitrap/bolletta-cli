import { schedina, computeOutcome } from "./bets";
import { fdCompetitionName } from "./domain/competitions";
import { fmtKickoff, fmtScore } from "./domain/formatters";
import { resolveMatch } from "./matchResolver";
import type { Row } from "./format";

export async function checkOnce(
  dateISO: string,
  tz: string,
  timeoutMs: number,
  verbose: boolean,
  dateWindow: number
) {
  const results = await Promise.all(
    schedina.map(async (pick) => {
      try {
        const resolved = await resolveMatch(pick.home, pick.away, dateISO, {
          timeoutMs,
          verbose,
          dateWindow,
        });
        const isError = resolved.reason === "ERROR";
        const errorCode = resolved.error?.code ?? "UNKNOWN";
        const outcome = isError
          ? { betStatus: "PENDING" as const, reason: `ERROR:${errorCode}` }
          : computeOutcome(pick, resolved.match);
        const compLabel =
          resolved.match?.competition?.name ||
          (resolved.provider === "football-data" ? fdCompetitionName(resolved.match?.competition?.id) : undefined) ||
          (resolved.provider === "thesportsdb" ? "TheSportsDB" : undefined) ||
          resolved.provider;
        const row: Row = {
          MATCH: `${pick.home} - ${pick.away}`,
          KICKOFF: fmtKickoff(resolved.match?.kickoffTime, tz),
          SCORE: fmtScore(resolved.match?.score),
          MATCH_STATUS: isError ? "ERROR" : resolved.match?.status.toUpperCase() ?? "NOT_FOUND",
          BET: pick.bet.label,
          BET_KIND: pick.bet.kind,
          BET_STATUS: outcome.betStatus,
          REASON: outcome.reason,
          PROVIDER: resolved.provider,
          SCORE_VALUE: resolved.match?.score ?? null,
          COMPETITION: compLabel,
          ERROR_CODE: isError ? errorCode : undefined,
          ERROR_MESSAGE: isError ? resolved.error?.message : undefined,
          ERROR_PROVIDER: isError ? resolved.error?.provider ?? resolved.provider : undefined,
        };
        return row;
      } catch (e) {
        if (verbose) console.warn(`[check] error for ${pick.home} vs ${pick.away}: ${(e as Error).message}`);
        const row: Row = {
          MATCH: `${pick.home} - ${pick.away}`,
          KICKOFF: "",
          SCORE: "-",
          MATCH_STATUS: "ERROR",
          BET: pick.bet.label,
          BET_KIND: pick.bet.kind,
          BET_STATUS: "PENDING",
          REASON: "ERROR:UNKNOWN",
          PROVIDER: "error",
          SCORE_VALUE: null,
          COMPETITION: "Errore",
          ERROR_CODE: "UNKNOWN",
          ERROR_MESSAGE: (e as Error).message,
          ERROR_PROVIDER: "check",
        };
        return row;
      }
    })
  );
  const allDone = results.every(
    (r) => r.BET_STATUS === "WIN" || r.BET_STATUS === "LOSE" || r.BET_STATUS === "NOT_FOUND"
  );
  return { results, allDone };
}
