import type { Row } from "../format";

function isScoreComplete(score?: { home: number | null; away: number | null } | null): score is {
  home: number;
  away: number;
} {
  return !!score && score.home != null && score.away != null;
}

export function computeProgress(r: Row): string {
  if (r.BET_STATUS === "WIN") return "Vinta";
  if (r.BET_STATUS === "LOSE") return "Persa";
  if (r.BET_STATUS === "NOT_FOUND") return "Non trovata";
  if (r.REASON.toUpperCase().startsWith("ERROR")) {
    const code = r.REASON.split(":", 2)[1] || "UNKNOWN";
    return `Errore: ${code}`;
  }

  const score = isScoreComplete(r.SCORE_VALUE) ? r.SCORE_VALUE : null;
  if (!score) return "In attesa di punteggio";

  const { home, away } = score;
  const sum = home + away;

  if (r.BET_KIND === "X2Under35") {
    const x2 = away >= home;
    const under = sum <= 3;
    if (x2 && under) return "Vincente al momento";
    const parts: string[] = [];
    if (!x2) parts.push("X2");
    if (!under) parts.push("Under 3.5");
    return `Manca: ${parts.join(" e ")}`;
  }

  if (r.BET_KIND === "X2Over25") {
    const x2 = away >= home;
    const over = sum >= 3;
    if (x2 && over) return "Vincente al momento";
    const parts: string[] = [];
    if (!x2) parts.push("X2");
    if (!over) parts.push("Over 2.5");
    return `Manca: ${parts.join(" e ")}`;
  }

  if (r.BET_KIND === "GG") {
    const hg = home >= 1;
    const ag = away >= 1;
    if (hg && ag) return "Vincente al momento";
    if (!hg && !ag) return "Mancano 2 gol (uno per squadra)";
    if (!hg) return "Manca: gol casa";
    if (!ag) return "Manca: gol ospiti";
  }

  if (r.BET_KIND === "12") {
    if (home !== away) return "Vincente al momento";
    return "Manca: sblocco pareggio";
  }

  if (r.BET_KIND === "Over25") {
    if (sum >= 3) return "Vincente al momento";
    const need = 3 - sum;
    return need === 1 ? "Manca: 1 gol" : `Mancano: ${need} gol`;
  }

  if (r.BET_KIND === "1") {
    if (home > away) return "Vincente al momento";
    if (home === away) return "Manca: vantaggio casa";
    return "Manca: rimonta casa";
  }

  if (r.BET_KIND === "1X") {
    if (home >= away) return "Vincente al momento";
    return "Manca: pareggio o vantaggio casa";
  }

  if (r.BET_KIND === "X2") {
    if (away >= home) return "Vincente al momento";
    return "Manca: pareggio o vantaggio ospiti";
  }

  if (r.BET_KIND === "2") {
    if (away > home) return "Vincente al momento";
    if (home === away) return "Manca: vantaggio ospiti";
    return "Manca: rimonta ospiti";
  }

  if (r.BET_KIND === "Under25") {
    if (sum <= 2) return "Vincente al momento";
    return "Soglia superata";
  }

  return "In corso";
}
