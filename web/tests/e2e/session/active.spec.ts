import { test, expect } from "@playwright/test";
import { BASE_URL, setupTwoPeers } from "../../tests/helpers/session";

test.describe("Active session view", () => {
  test("both peers see collaboration panel after connecting", async ({ browser }) => {
    const { ctxA, ctxB, pageA } = await setupTwoPeers(browser);
    try {
      await expect(
        pageA.locator("text=/Establish Direct Connection|Waiting for clients/i").first()
      ).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("connection type shows WebSocket badge", async ({ browser }) => {
    const { ctxA, ctxB, pageA } = await setupTwoPeers(browser);
    try {
      await expect(pageA.locator("text=WebSocket").first()).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("session code appears in status bar", async ({ browser }) => {
    const { ctxA, ctxB, pageA, sessionCode } = await setupTwoPeers(browser);
    try {
      await expect(pageA.locator(`text=${sessionCode}`).first()).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("navigating to a session without being connected redirects", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/X-FAKE01`);
    await page.waitForURL(`${BASE_URL}/session/create`, { timeout: 5_000 });
  });
});
