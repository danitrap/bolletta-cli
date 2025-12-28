import { describe, expect, test } from "bun:test";
import type { RowData } from "../src/domain/row";
import { computeProgress } from "../src/domain/progress";

function makeRow(partial: Partial<RowData>): RowData {
  return {
    home: "Home",
    away: "Away",
    kickoffTime: undefined,
    score: null,
    matchStatus: "LIVE",
    betLabel: "X2 + Under 3.5",
    betKind: "X2Under35",
    betStatus: "PENDING",
    reason: "LIVE",
    provider: "test",
    ...partial,
  };
}

describe("computeProgress", () => {
  test("uses bet kind and score", () => {
    const row = makeRow({ score: { home: 1, away: 2 } });
    expect(computeProgress(row)).toBe("Vincente al momento");
  });

  test("no score -> waiting message", () => {
    const row = makeRow({ score: { home: null, away: null } });
    expect(computeProgress(row)).toBe("In attesa di punteggio");
  });

  test("error reason shows error code", () => {
    const row = makeRow({ reason: "ERROR:HTTP" });
    expect(computeProgress(row)).toBe("Errore: HTTP");
  });
});
