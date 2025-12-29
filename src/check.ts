import { schedina, computeOutcome } from "./bets";
import { fdCompetitionName } from "./domain/competitions";
import { makeReason, matchStatusCodeFromProvider } from "./domain/codes";
import { resolveMatch } from "./matchResolver";
import type { RowData } from "./domain/row";

export async function checkOnce(
  dateISO: string,
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
          ? { betStatus: "PENDING" as const, reason: makeReason("ERROR", errorCode) }
          : computeOutcome(pick, resolved.match);
        const compLabel =
          resolved.match?.competition?.name ||
          (resolved.provider === "football-data" ? fdCompetitionName(resolved.match?.competition?.id) : undefined) ||
          (resolved.provider === "thesportsdb" ? "TheSportsDB" : undefined) ||
          resolved.provider;
        const matchStatus = isError
          ? "ERROR"
          : resolved.match
          ? matchStatusCodeFromProvider(resolved.match.status)
          : "NOT_FOUND";
        const row: RowData = {
          home: pick.home,
          away: pick.away,
          kickoffTime: resolved.match?.kickoffTime,
          score: resolved.match?.score ?? null,
          matchStatus,
          betLabel: pick.bet.label,
          betKind: pick.bet.kind,
          betStatus: outcome.betStatus,
          reason: outcome.reason,
          provider: resolved.provider,
          competition: compLabel,
          errorCode: isError ? errorCode : undefined,
          errorMessage: isError ? resolved.error?.message : undefined,
          errorProvider: isError ? resolved.error?.provider ?? resolved.provider : undefined,
        };
        return row;
      } catch (e) {
        if (verbose) console.warn(`[check] error for ${pick.home} vs ${pick.away}: ${(e as Error).message}`);
        const row: RowData = {
          home: pick.home,
          away: pick.away,
          kickoffTime: undefined,
          score: null,
          matchStatus: "ERROR",
          betLabel: pick.bet.label,
          betKind: pick.bet.kind,
          betStatus: "PENDING",
          reason: makeReason("ERROR", "UNKNOWN"),
          provider: "error",
          competition: "Errore",
          errorCode: "UNKNOWN",
          errorMessage: (e as Error).message,
          errorProvider: "check",
        };
        return row;
      }
    })
  );
  const allDone = results.every(
    (r) => r.betStatus === "WIN" || r.betStatus === "LOSE" || r.betStatus === "NOT_FOUND"
  );
  return { results, allDone };
}
