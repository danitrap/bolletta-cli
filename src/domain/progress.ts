import type { RowData } from "./row";
import { t } from "../presentation/i18n";

function isScoreComplete(score?: { home: number | null; away: number | null } | null): score is {
  home: number;
  away: number;
} {
  return !!score && score.home != null && score.away != null;
}

export function computeProgress(r: RowData): string {
  if (r.betStatus === "WIN") return t("progress.win");
  if (r.betStatus === "LOSE") return t("progress.lose");
  if (r.betStatus === "NOT_FOUND") return t("progress.notFound");
  if (r.reason.toUpperCase().startsWith("ERROR")) {
    const code = r.reason.split(":", 2)[1] || "UNKNOWN";
    return t("progress.error", { code });
  }

  const score = isScoreComplete(r.score) ? r.score : null;
  if (!score) return t("progress.awaitingScore");

  const { home, away } = score;
  const sum = home + away;
  const joiner = ` ${t("common.and")} `;
  const joinParts = (parts: string[]) => parts.join(joiner);
  const missingList = (parts: string[]) =>
    t(parts.length > 1 ? "progress.missingPlural" : "progress.missing", { items: joinParts(parts) });

  if (r.betKind === "X2Under35") {
    const x2 = away >= home;
    const under = sum <= 3;
    if (x2 && under) return t("progress.winningNow");
    const parts: string[] = [];
    if (!x2) parts.push(t("progress.parts.x2"));
    if (!under) parts.push(t("progress.parts.under35"));
    return missingList(parts);
  }

  if (r.betKind === "X2Over25") {
    const x2 = away >= home;
    const over = sum >= 3;
    if (x2 && over) return t("progress.winningNow");
    const parts: string[] = [];
    if (!x2) parts.push(t("progress.parts.x2"));
    if (!over) parts.push(t("progress.parts.over25"));
    return missingList(parts);
  }

  if (r.betKind === "GG") {
    const hg = home >= 1;
    const ag = away >= 1;
    if (hg && ag) return t("progress.winningNow");
    if (!hg && !ag) return t("progress.missingTwoGoalsOnePerTeam");
    if (!hg) return t("progress.missingHomeGoal");
    if (!ag) return t("progress.missingAwayGoal");
  }

  if (r.betKind === "12") {
    if (home !== away) return t("progress.winningNow");
    return t("progress.missingUnlockDraw");
  }

  if (r.betKind === "Over25") {
    if (sum >= 3) return t("progress.winningNow");
    const need = 3 - sum;
    return need === 1
      ? t("progress.missingGoals", { count: need })
      : t("progress.missingGoalsPlural", { count: need });
  }

  if (r.betKind === "1") {
    if (home > away) return t("progress.winningNow");
    if (home === away) return t("progress.missingHomeLead");
    return t("progress.missingHomeComeback");
  }

  if (r.betKind === "1X") {
    if (home >= away) return t("progress.winningNow");
    return t("progress.missingHomeLeadOrDraw");
  }

  if (r.betKind === "X2") {
    if (away >= home) return t("progress.winningNow");
    return t("progress.missingAwayLeadOrDraw");
  }

  if (r.betKind === "2") {
    if (away > home) return t("progress.winningNow");
    if (home === away) return t("progress.missingAwayLead");
    return t("progress.missingAwayComeback");
  }

  if (r.betKind === "Under25") {
    if (sum <= 2) return t("progress.winningNow");
    return t("progress.thresholdExceeded");
  }

  return t("progress.inProgress");
}
