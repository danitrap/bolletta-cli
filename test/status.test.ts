import { describe, expect, test } from "bun:test";
import { mapFootballDataStatus, mapTheSportsDbStatus } from "../src/domain/status";
import { classifyError } from "../src/domain/errors";

describe("status mapping", () => {
  test("football-data status mapping", () => {
    expect(mapFootballDataStatus("FINISHED")).toBe("finished");
    expect(mapFootballDataStatus("SCHEDULED")).toBe("scheduled");
  });

  test("theSportsDb status mapping", () => {
    expect(mapTheSportsDbStatus("Match Finished")).toBe("finished");
    expect(mapTheSportsDbStatus("Postponed")).toBe("postponed");
  });
});

describe("error classification", () => {
  test("timeout errors", () => {
    const err = new Error("timeout while fetching");
    const out = classifyError(err, "provider");
    expect(out.code).toBe("TIMEOUT");
    expect(out.provider).toBe("provider");
  });
});
