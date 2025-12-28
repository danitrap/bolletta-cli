import { describe, expect, test } from "bun:test";
import { toJSON } from "../src/format";
import type { RowData } from "../src/domain/row";

describe("toJSON", () => {
  test("adds error object when reason indicates error", () => {
    const rows: RowData[] = [
      {
        home: "A",
        away: "B",
        kickoffTime: undefined,
        score: null,
        matchStatus: "ERROR",
        betLabel: "GG",
        betKind: "GG",
        betStatus: "PENDING",
        reason: "ERROR:HTTP",
        provider: "football-data",
      },
    ];
    const out = toJSON(rows, "Europe/Rome", "it");
    expect(out[0].error?.code).toBe("HTTP");
  });
});
