import { describe, expect, test } from "bun:test";
import { toJSON, type Row } from "../src/format";

describe("toJSON", () => {
  test("adds error object when reason indicates error", () => {
    const rows: Row[] = [
      {
        MATCH: "A - B",
        KICKOFF: "",
        SCORE: "-",
        MATCH_STATUS: "ERROR",
        BET: "GG",
        BET_KIND: "GG",
        BET_STATUS: "PENDING",
        REASON: "ERROR:HTTP",
        PROVIDER: "football-data",
        SCORE_VALUE: null,
      },
    ];
    const out = toJSON(rows);
    expect(out[0].error?.code).toBe("HTTP");
  });
});
