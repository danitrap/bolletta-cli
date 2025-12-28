import { fetchJSON } from "../util/http";
import type { MatchProvider, ProviderMatch, ProviderStatus } from "../types";

type FootballDataMatch = {
  id: number;
  utcDate?: string;
  status: string;
  homeTeam: { id?: number; name: string };
  awayTeam: { id?: number; name: string };
  score: {
    winner: string | null;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
};

type FootballDataResponse = {
  resultSet?: unknown;
  matches: FootballDataMatch[];
};

function mapStatus(s: string): ProviderStatus {
  switch (s) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "SCHEDULED":
    case "TIMED":
      return "scheduled";
    case "POSTPONED":
      return "postponed";
    case "CANCELED":
      return "canceled";
    case "SUSPENDED":
      return "live"; // treat as live/pending
    default:
      return "unknown";
  }
}

export class FootballDataProvider implements MatchProvider {
  name = "football-data";

  canUse(): boolean {
    return !!Bun.env.FOOTBALL_DATA_TOKEN;
  }

  async listMatchesByDate(dateISO: string, timeoutMs: number): Promise<ProviderMatch[]> {
    const token = Bun.env.FOOTBALL_DATA_TOKEN;
    const defaultComps = ["2001", "2002", "2014", "2015", "2019", "2021"]; // CL, BL1, PD, FL1, SA, PL
    const comps = (Bun.env.FOOTBALL_DATA_COMPETITIONS || defaultComps.join(",")).split(/[,\s]+/).filter(Boolean);

    const out: ProviderMatch[] = [];
    for (const comp of comps) {
      const url = `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${dateISO}&dateTo=${dateISO}`;
      const data = await fetchJSON<FootballDataResponse>(url, {
        timeoutMs,
        headers: {
          "X-Auth-Token": token ?? "",
        },
        cacheKey: `${this.name}:comp:${comp}:${dateISO}`,
      });
      const mapped = (data.matches || []).map((m): ProviderMatch => {
        const full = m.score?.fullTime ?? { home: null, away: null };
        const half = m.score?.halfTime ?? { home: null, away: null };
        const score =
          full?.home != null && full?.away != null
            ? { home: full.home, away: full.away }
            : half?.home != null && half?.away != null
            ? { home: half.home, away: half.away }
            : { home: null, away: null };
        return {
          provider: this.name,
          id: String(m.id),
          home: m.homeTeam?.name ?? "",
          away: m.awayTeam?.name ?? "",
          kickoffTime: m.utcDate,
          status: mapStatus(m.status ?? ""),
          score,
          raw: m,
          competition: { id: String(comp) },
        };
      });
      out.push(...mapped);
    }
    return out;
  }
}
