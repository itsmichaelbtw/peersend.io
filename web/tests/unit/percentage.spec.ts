/**
 * Unit tests for calculatePercentage.
 * Imported directly from the web source to test the real implementation.
 */

import { test, expect } from "@playwright/test";
import { calculatePercentage } from "../../src/lib/file-transfer/utils";

test.describe("calculatePercentage", () => {
  test("returns 0 when numerator is 0 and denominator is non-zero", () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  test("returns 100 when numerator equals denominator", () => {
    expect(calculatePercentage(100, 100)).toBe(100);
  });

  test("returns 50 for half", () => {
    expect(calculatePercentage(50, 100)).toBe(50);
  });

  test("rounds to nearest integer", () => {
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(2, 3)).toBe(67);
  });

  test("handles large numbers", () => {
    expect(calculatePercentage(500_000_000, 1_000_000_000)).toBe(50);
  });

  test("returns 100 (not NaN) for empty file (0 / 0) — bug fix regression", () => {
    const result = calculatePercentage(0, 0);
    expect(result).toBe(100);
    expect(Number.isNaN(result)).toBe(false);
  });

  test("returns 0 (not NaN) for corrupt state (received > 0, size = 0) — bug fix regression", () => {
    const result = calculatePercentage(5, 0);
    expect(result).toBe(0);
    expect(Number.isNaN(result)).toBe(false);
  });
});
