import { FootballDataProvider } from "./providers/footballData";
import { TheSportsDbProvider } from "./providers/theSportsDb";
import { classifyError } from "./domain/errors";
import { normalizeTeamName, teamSimilarity } from "./util/strings";
import type { ProviderMatch, ResolveError, ResolvedMatch } from "./types";

const fd = new FootballDataProvider();
const tsd = new TheSportsDbProvider();

type ResolverOptions = {
  timeoutMs: number;
  verbose?: boolean;
  dateWindow?: number; // +/- days around dateISO to search for football-data
};

export async function resolveMatch(
  home: string,
  away: string,
  dateISO: string,
  opts: ResolverOptions
): Promise<ResolvedMatch> {
  const { timeoutMs, verbose } = opts;
  const window = Math.max(0, opts.dateWindow ?? 0);
  const normalizedHome = normalizeTeamName(home);
  const normalizedAway = normalizeTeamName(away);
  let lastError: ResolveError | undefined;

  // 1) football-data primary
  if (fd.canUse()) {
    try {
      const acc: ProviderMatch[] = [];
      const seen = new Set<string>();
      const base = new Date(dateISO + 'T00:00:00Z');
      for (let d = -window; d <= window; d++) {
        const dt = new Date(base);
        dt.setUTCDate(base.getUTCDate() + d);
        const iso = dt.toISOString().slice(0, 10);
        const dayList = await fd.listMatchesByDate(iso, timeoutMs);
        for (const m of dayList) {
          const key = `${m.provider}:${m.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            acc.push(m);
          }
        }
      }
      const list = acc;
      const best = pickBest(list, normalizedHome, normalizedAway, 0.78);
      if (best) {
        const confidence = calcConfidence(best, normalizedHome, normalizedAway);
        if (verbose)
          console.log(`[resolver] football-data match: ${best.home} vs ${best.away} (conf=${confidence.toFixed(2)})`);
        return { provider: fd.name, match: best, confidence };
      }
    } catch (e) {
      lastError = classifyError(e, fd.name);
      if (verbose) console.warn(`[resolver] football-data error: ${(e as Error).message}`);
    }
  }

  // 2) fallback TheSportsDB
  try {
    const m = await tsd.searchAndLookup(home, away, dateISO, timeoutMs);
    if (m) {
      const confidence = calcConfidence(m, normalizedHome, normalizedAway);
      if (confidence >= 0.82) {
        if (verbose)
          console.log(`[resolver] thesportsdb match: ${m.home} vs ${m.away} (conf=${confidence.toFixed(2)})`);
        return { provider: tsd.name, match: m, confidence };
      } else {
        if (verbose)
          console.log(`[resolver] thesportsdb low confidence: ${m.home} vs ${m.away} (conf=${confidence.toFixed(2)})`);
      }
    }
  } catch (e) {
    lastError = classifyError(e, tsd.name);
    if (verbose) console.warn(`[resolver] thesportsdb error: ${(e as Error).message}`);
  }

  if (lastError) {
    return {
      provider: lastError.provider ?? (fd.canUse() ? fd.name : tsd.name),
      match: null,
      confidence: 0,
      reason: "ERROR",
      error: lastError,
    };
  }
  return { provider: fd.canUse() ? fd.name : tsd.name, match: null, confidence: 0, reason: "NOT_FOUND" };
}

function pickBest(
  list: ProviderMatch[],
  home: string,
  away: string,
  threshold = 0.82
): ProviderMatch | null {
  let best: { m: ProviderMatch; score: number } | null = null;
  for (const m of list) {
    const dir = (teamSimilarity(home, m.home) + teamSimilarity(away, m.away)) / 2;
    const rev = (teamSimilarity(home, m.away) + teamSimilarity(away, m.home)) / 2;
    const score = Math.max(dir, rev);
    if (!best || score > best.score) best = { m, score };
  }
  if (best && best.score >= threshold) return best.m; // threshold to accept
  return null;
}

function calcConfidence(m: ProviderMatch, home: string, away: string): number {
  const dir = (teamSimilarity(home, m.home) + teamSimilarity(away, m.away)) / 2;
  const rev = (teamSimilarity(home, m.away) + teamSimilarity(away, m.home)) / 2;
  return Math.max(dir, rev);
}
