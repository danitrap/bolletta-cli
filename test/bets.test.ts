import { describe, expect, test } from "bun:test";
import {
  evalX2,
  evalUnder35,
  evalX2Under35,
  evalGG,
  eval12,
  evalOver25,
  eval1,
  eval1X,
  eval2,
  evalUnder25,
  evalX2Over25,
} from "../src/bets";

describe("X2 + Under 3.5", () => {
  test("0-0 WIN", () => {
    expect(evalX2Under35({ home: 0, away: 0 })).toBeTrue();
  });
  test("1-2 WIN", () => {
    expect(evalX2Under35({ home: 1, away: 2 })).toBeTrue();
  });
  test("2-2 LOSE (under fail)", () => {
    expect(evalX2Under35({ home: 2, away: 2 })).toBeFalse();
  });
  test("0-4 LOSE (under fail)", () => {
    expect(evalX2Under35({ home: 0, away: 4 })).toBeFalse();
  });
  test("2-1 LOSE (x2 fail)", () => {
    expect(evalX2Under35({ home: 2, away: 1 })).toBeFalse();
  });
});

describe("GG", () => {
  test("1-1 WIN", () => {
    expect(evalGG({ home: 1, away: 1 })).toBeTrue();
  });
  test("0-2 LOSE", () => {
    expect(evalGG({ home: 0, away: 2 })).toBeFalse();
  });
  test("2-0 LOSE", () => {
    expect(evalGG({ home: 2, away: 0 })).toBeFalse();
  });
});

describe("12", () => {
  test("2-0 WIN", () => {
    expect(eval12({ home: 2, away: 0 })).toBeTrue();
  });
  test("1-1 LOSE", () => {
    expect(eval12({ home: 1, away: 1 })).toBeFalse();
  });
});

describe("Over 2.5", () => {
  test("2-1 WIN", () => {
    expect(evalOver25({ home: 2, away: 1 })).toBeTrue();
  });
  test("1-1 LOSE", () => {
    expect(evalOver25({ home: 1, away: 1 })).toBeFalse();
  });
});

describe("1 (home win)", () => {
  test("1-0 WIN", () => {
    expect(eval1({ home: 1, away: 0 })).toBeTrue();
  });
  test("0-0 LOSE", () => {
    expect(eval1({ home: 0, away: 0 })).toBeFalse();
  });
  test("0-1 LOSE", () => {
    expect(eval1({ home: 0, away: 1 })).toBeFalse();
  });
});

describe("X2", () => {
  test("0-0 WIN", () => {
    expect(evalX2({ home: 0, away: 0 })).toBeTrue();
  });
  test("1-2 WIN", () => {
    expect(evalX2({ home: 1, away: 2 })).toBeTrue();
  });
  test("2-1 LOSE", () => {
    expect(evalX2({ home: 2, away: 1 })).toBeFalse();
  });
});

describe("1X (double chance)", () => {
  test("1-0 WIN", () => {
    expect(eval1X({ home: 1, away: 0 })).toBeTrue();
  });
  test("0-0 WIN", () => {
    expect(eval1X({ home: 0, away: 0 })).toBeTrue();
  });
  test("0-1 LOSE", () => {
    expect(eval1X({ home: 0, away: 1 })).toBeFalse();
  });
});

describe("2 (away win)", () => {
  test("0-1 WIN", () => {
    expect(eval2({ home: 0, away: 1 })).toBeTrue();
  });
  test("1-1 LOSE", () => {
    expect(eval2({ home: 1, away: 1 })).toBeFalse();
  });
  test("2-1 LOSE", () => {
    expect(eval2({ home: 2, away: 1 })).toBeFalse();
  });
});

describe("Under 2.5", () => {
  test("1-1 WIN", () => {
    expect(evalUnder25({ home: 1, away: 1 })).toBeTrue();
  });
  test("2-0 WIN", () => {
    expect(evalUnder25({ home: 2, away: 0 })).toBeTrue();
  });
  test("2-1 LOSE", () => {
    expect(evalUnder25({ home: 2, away: 1 })).toBeFalse();
  });
});

describe("X2 + Over 2.5", () => {
  test("1-2 WIN", () => {
    expect(evalX2Over25({ home: 1, away: 2 })).toBeTrue();
  });
  test("0-3 WIN", () => {
    expect(evalX2Over25({ home: 0, away: 3 })).toBeTrue();
  });
  test("2-2 WIN", () => {
    expect(evalX2Over25({ home: 2, away: 2 })).toBeTrue();
  });
  test("2-0 LOSE (x2 fail)", () => {
    expect(evalX2Over25({ home: 2, away: 0 })).toBeFalse();
  });
  test("1-1 LOSE (over fail)", () => {
    expect(evalX2Over25({ home: 1, away: 1 })).toBeFalse();
  });
});
