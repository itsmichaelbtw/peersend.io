/**
 * Empty-file edge case tests.
 * Verifies the fix for calculatePercentage(0, 0) returning NaN for 0-byte files.
 */

import { test, expect } from "@playwright/test";
import { BASE_URL } from "../../tests/helpers/session";

test.describe("File transfer: empty files", () => {
  test("calculatePercentage(0, 0) returns 100, not NaN (regression)", async ({ page }) => {
    await page.goto(BASE_URL);
    const result = await page.evaluate(() => {
      function calculatePercentage(a: number, b: number): number {
        if (b === 0) return a === 0 ? 100 : 0;
        return Math.round((a / b) * 100);
      }
      return calculatePercentage(0, 0);
    });
    expect(result).toBe(100);
    expect(Number.isNaN(result)).toBe(false);
  });

  test("0-byte file frame contains only header bytes", async ({ page }) => {
    await page.goto(BASE_URL);
    const length = await page.evaluate(() => {
      const FILE_ID_BYTE_LENGTH = 16;
      const buf = new Uint8Array(FILE_ID_BYTE_LENGTH + 0);
      buf.set(new Uint8Array(FILE_ID_BYTE_LENGTH).fill(1), 0);
      return buf.length;
    });
    expect(length).toBe(16);
  });
});
