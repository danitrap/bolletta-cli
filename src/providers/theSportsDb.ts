import { fetchJSON } from "../util/http";
import { normalizeTeamName, teamSimilarity } from "../util/strings";
import type { MatchProvider, ProviderMatch, ProviderStatus } from "../types";

type SearchEventsResp = {
  event?: Array<{
    idEvent: string;
    strEvent: string; // "Home vs Away"
    dateEvent?: string; // YYYY-MM-DD
  }>;
};

type LookupEventResp = {
  events?: Array<{
    idEvent: string;
    strEvent: string;
    idLeague?: string;
    strLeague?: string;
    dateEvent?: string; // YYYY-MM-DD
    strTime?: string; // HH:mm:ss
    strTimestamp?: string; // ISO string
    strStatus?: string | null; // "Match Finished", "Postponed", etc
    intHomeScore?: string | null;
    intAwayScore?: string | null;
    strHomeTeam?: string;
    strAwayTeam?: string;
  }>;
};

function mapStatus(s?: string | null): ProviderStatus {
  const v = (s || "").toLowerCase();
  if (!v) return "unknown";
  if (v.includes("finished") || v.includes("ft")) return "finished";
  if (v.includes("postponed")) return "postponed";
  if (v.includes("canceled") || v.includes("cancelled")) return "canceled";
  if (v.includes("live") || v.includes("in play") || v.includes("1h") || v.includes("2h"))
    return "live";
  if (v.includes("scheduled") || v.includes("not started") || v.includes("timed"))
    return "scheduled";
  return "unknown";
}

export class TheSportsDbProvider implements MatchProvider {
  name = "thesportsdb";

  canUse(): boolean {
    return true; // free endpoints with key (default = 3)
  }

  async listMatchesByDate(dateISO: string, timeoutMs: number): Promise<ProviderMatch[]> {
    // TheSportsDB doesn't offer a perfect list-by-date for all sports via key=1 reliably.
    // We'll fetch nothing here; this provider is used via targeted search per match in resolver.
    // To respect the interface, return empty; resolver will query search+lookup when needed.
    return [];
  }

  async searchAndLookup(
    home: string,
    away: string,
    dateISO: string,
    timeoutMs: number
  ): Promise<ProviderMatch | null> {
    const mk = (s: string) =>
      s
        .trim()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9\s]/g, " ")
        .replace(/\s+/g, "_");
    const eparam = `${mk(home)}_vs_${mk(away)}`; // per docs: Arsenal_vs_Chelsea
    // Prefer a configurable API key; per docs current free key is 123.
    const key = Bun.env.THESPORTSDB_KEY || Bun.env.TSD_API_KEY || "123";
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/${key}/searchevents.php?e=${encodeURIComponent(eparam)}&d=${dateISO}`;
    const search = await fetchJSON<SearchEventsResp>(searchUrl, {
      timeoutMs,
      cacheKey: `${this.name}:search:${eparam}:${dateISO}`,
    });
    const events = search.event ?? [];
    if (!events.length) return null;

    const nh = normalizeTeamName(home);
    const na = normalizeTeamName(away);

    const sameDay = events.filter((e) => e.dateEvent === dateISO);
    if (!sameDay.length) return null; // don't risk mismatching different dates

    let best: { e: (typeof events)[number]; score: number } | null = null;
    const consider = sameDay;
    for (const e of consider) {
      const parts = (e.strEvent || "").split(/\s+vs\s+|\s+v\s+|\s*-\s*/i).map((s) => s.trim());
      if (parts.length < 2) continue;
      const s1 = teamSimilarity(nh, parts[0]);
      const s2 = teamSimilarity(na, parts[1]);
      const score = (s1 + s2) / 2;
      if (!best || score > best.score) best = { e, score };
    }
    if (!best || best.score < 0.82) return null; // too fuzzy; avoid false positives
    const cand = best.e;
    const lookupUrl = `https://www.thesportsdb.com/api/v1/json/${key}/lookupevent.php?id=${cand.idEvent}`;
    const lookup = await fetchJSON<LookupEventResp>(lookupUrl, {
      timeoutMs,
      cacheKey: `${this.name}:lookup:${cand.idEvent}`,
    });
    const ev = lookup.events?.[0];
    if (!ev) return null;
    // Prefer the timestamp (includes timezone). If missing, parse date+time without forcing UTC.
    // This treats the naive time in the server's local TZ; later we render in Europe/Rome explicitly.
    const kickoff = ev.strTimestamp
      ? new Date(ev.strTimestamp).toISOString()
      : ev.dateEvent && ev.strTime
      ? new Date(`${ev.dateEvent}T${ev.strTime}`).toISOString()
      : ev.dateEvent
      ? new Date(`${ev.dateEvent}T00:00:00`).toISOString()
      : undefined;
    const score = {
      home: ev.intHomeScore != null ? Number(ev.intHomeScore) : null,
      away: ev.intAwayScore != null ? Number(ev.intAwayScore) : null,
    };
    return {
      provider: this.name,
      id: ev.idEvent,
      home: ev.strHomeTeam ?? "",
      away: ev.strAwayTeam ?? "",
      kickoffTime: kickoff,
      status: mapStatus(ev.strStatus),
      score,
      raw: ev,
      competition: { id: ev.idLeague, name: ev.strLeague },
    };
  }
}
