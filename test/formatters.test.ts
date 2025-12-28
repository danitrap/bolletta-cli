import { describe, expect, test } from "bun:test";
import { fmtKickoff, fmtScore } from "../src/domain/formatters";

describe("formatters", () => {
  test("fmtScore uses dash without full score", () => {
    expect(fmtScore({ home: null, away: null })).toBe("-");
  });

  test("fmtScore prints full score", () => {
    expect(fmtScore({ home: 2, away: 1 })).toBe("2-1");
  });

  test("fmtKickoff formats ISO date in a timezone", () => {
    const iso = "2025-01-02T12:34:00Z";
    const out = fmtKickoff(iso, "Europe/Rome");
    expect(out).toContain("02/01/2025");
  });
});
