import { describe, expect, test } from "bun:test";
import { parseArgs } from "../src/cli";

describe("parseArgs", () => {
  test("defaults", () => {
    const args = parseArgs([]);
    expect(args.interval).toBe(60);
    expect(args.timeout).toBe(10000);
    expect(args.window).toBe(0);
  });

  test("numeric parsing with invalid values", () => {
    const args = parseArgs(["--interval", "x", "--timeout=nan", "--window", "-2"]);
    expect(args.interval).toBe(60);
    expect(args.timeout).toBe(10000);
    expect(args.window).toBe(0);
  });

  test("flags", () => {
    const args = parseArgs(["--json", "--once", "--verbose"]);
    expect(args.json).toBeTrue();
    expect(args.once).toBeTrue();
    expect(args.verbose).toBeTrue();
  });
});
