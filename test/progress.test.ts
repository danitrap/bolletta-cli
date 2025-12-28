import { describe, expect, test } from "bun:test";
import type { Row } from "../src/format";
import { computeProgress } from "../src/domain/progress";

function makeRow(partial: Partial<Row>): Row {
  return {
    MATCH: "Home - Away",
    KICKOFF: "",
    SCORE: "-",
    MATCH_STATUS: "LIVE",
    BET: "X2 + Under 3.5",
    BET_KIND: "X2Under35",
    BET_STATUS: "PENDING",
    REASON: "LIVE",
    PROVIDER: "test",
    SCORE_VALUE: null,
    ...partial,
  };
}

describe("computeProgress", () => {
  test("uses bet kind and score", () => {
    const row = makeRow({ SCORE_VALUE: { home: 1, away: 2 } });
    expect(computeProgress(row)).toBe("Vincente al momento");
  });

  test("no score -> waiting message", () => {
    const row = makeRow({ SCORE_VALUE: { home: null, away: null } });
    expect(computeProgress(row)).toBe("In attesa di punteggio");
  });

  test("error reason shows error code", () => {
    const row = makeRow({ REASON: "ERROR:HTTP" });
    expect(computeProgress(row)).toBe("Errore: HTTP");
  });
});
