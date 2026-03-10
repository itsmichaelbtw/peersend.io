import { test, expect } from "@playwright/test";
import { BASE_URL } from "../../helpers/session";

test.describe("File transfer: MIME types", () => {
  test("Blob constructor accepts various MIME types", async ({ page }) => {
    await page.goto(BASE_URL);
    const allPassed = await page.evaluate(() => {
      const types = [
        "image/png", "application/pdf", "application/zip",
        "", "application/octet-stream", "application/json", "text/plain",
      ];
      try {
        for (const type of types) {
          const blob = new Blob([new Uint8Array([1, 2, 3])], { type });
          if (blob.size !== 3) return false;
        }
        return true;
      } catch {
        return false;
      }
    });
    expect(allPassed).toBe(true);
  });
});
