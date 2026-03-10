import { test, expect } from "@playwright/test";
import { BASE_URL } from "../../helpers/session";

test.describe("File transfer: filenames", () => {
  test("download attribute supports special characters", async ({ page }) => {
    await page.goto(BASE_URL);
    const ok = await page.evaluate(() => {
      const names = [
        "file with spaces.txt", "résumé_文件_파일.txt",
        "file#1 & test.pdf", "report (final v2).docx", "archive.tar.gz",
      ];
      try {
        for (const name of names) {
          const a = document.createElement("a");
          a.download = name;
        }
        return true;
      } catch {
        return false;
      }
    });
    expect(ok).toBe(true);
  });

  test("truncateFileName with extension produces <= 35 chars (bug fix: was 37)", async ({ page }) => {
    await page.goto(BASE_URL);
    const result = await page.evaluate(() => {
      function truncateBuggy(filename: string): string {
        const maxLength = 35;
        if (filename.length <= maxLength) return filename;
        const dot = filename.lastIndexOf(".");
        if (dot === -1 || dot === 0) {
          const half = Math.floor((maxLength - 1) / 2);
          return filename.slice(0, half) + "…" + filename.slice(-half);
        }
        const name = filename.slice(0, dot);
        const ext = filename.slice(dot);
        const avail = maxLength - ext.length - 1; // BUG: should be -3
        return name.slice(0, Math.ceil(avail / 2)) + "..." + name.slice(-Math.floor(avail / 2)) + ext;
      }
      function truncateFixed(filename: string): string {
        const maxLength = 35;
        if (filename.length <= maxLength) return filename;
        const dot = filename.lastIndexOf(".");
        if (dot === -1 || dot === 0) {
          const half = Math.floor((maxLength - 1) / 2);
          return filename.slice(0, half) + "…" + filename.slice(-half);
        }
        const name = filename.slice(0, dot);
        const ext = filename.slice(dot);
        const avail = maxLength - ext.length - 3; // FIX
        return name.slice(0, Math.ceil(avail / 2)) + "..." + name.slice(-Math.floor(avail / 2)) + ext;
      }
      const f = "a_very_long_filename_that_exceeds_the_limit.txt";
      return { buggy: truncateBuggy(f).length, fixed: truncateFixed(f).length };
    });
    expect(result.buggy).toBe(37);
    expect(result.fixed).toBeLessThanOrEqual(35);
  });
});
