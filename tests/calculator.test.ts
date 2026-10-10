import { describe, expect, it } from "vitest";
import { CalculationError, evaluateExpression, formatResult } from "@/lib/calculator";
import { addHistoryEntry, readHistory } from "@/lib/history";
import type { HistoryEntry } from "@/types/calculator";

describe("evaluateExpression", () => {
  it.each([
    ["2 + 3", 5], ["9 - 12", -3], ["3 * 4", 12], ["12 / 4", 3],
    ["2 + 3 * 4", 14], ["(2 + 3) * 4", 20], ["2 * (3 + 4)^2", 98],
    ["sqrt(16) + 2^3", 12], ["2^3", 8], ["sin(pi / 2)", 1],
    ["cos(0)", 1], ["tan(0)", 0], ["log10(100)", 2], ["log(e)", 1],
    ["ln(e)", 1], ["pi", Math.PI], ["e", Math.E], ["5!", 120],
    ["-2.5 + 1", -1.5], ["50 % 9", 5],
  ])("evaluates %s", (expression, expected) => {
    expect(evaluateExpression(expression)).toBeCloseTo(expected as number, 12);
  });

  it("formats finite values cleanly", () => {
    expect(formatResult(5)).toBe("5");
    expect(formatResult(2.5)).toBe("2.5");
    expect(formatResult(-0)).toBe("0");
    expect(formatResult(1 / 3)).toBe("0.333333333333");
  });

  it.each(["1 / 0", "sqrt(-1)", "log10(0)", "(-1)!", "2 +", "", "3.5!"])("rejects invalid expression %s", (expression) => {
    expect(() => evaluateExpression(expression)).toThrow(CalculationError);
  });

  it.each(["process.exit()", "globalThis.alert(1)", "x = 1", "2; 3", "constructor(1)"])("rejects arbitrary code %s", (expression) => {
    expect(() => evaluateExpression(expression)).toThrow(CalculationError);
  });
});

describe("history helpers", () => {
  const entry: HistoryEntry = { id: "1", expression: "2 + 2", result: "4", value: 4, createdAt: 1 };
  it("ignores invalid stored data", () => {
    expect(readHistory("invalid")).toEqual([]);
    expect(readHistory(JSON.stringify([{ expression: "bad" }]))).toEqual([]);
  });
  it("deduplicates a repeated calculation and adds recent entries first", () => {
    const next = addHistoryEntry([entry], { ...entry, id: "2", createdAt: 2 });
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe("2");
  });
});
