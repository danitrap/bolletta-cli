import { describe, expect, test } from "bun:test";
import { normalizeTeamName, jaroWinkler, teamSimilarity } from "../src/util/strings";

describe("normalizeTeamName", () => {
  test("strips accents and punctuation", () => {
    expect(normalizeTeamName("Tottenham Hotspur!")).toBe("tottenham");
  });
  test("aliases", () => {
    expect(normalizeTeamName("Internazionale")).toBe("inter");
  });
});

describe("similarity", () => {
  test("identical -> 1", () => {
    expect(jaroWinkler("inter", "inter")).toBeCloseTo(1, 5);
  });
  test("teamSimilarity handles aliases", () => {
    expect(teamSimilarity("Internazionale", "Inter")).toBeGreaterThan(0.95);
  });
});

