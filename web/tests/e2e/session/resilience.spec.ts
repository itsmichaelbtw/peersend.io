import { test, expect } from "@playwright/test";
import { setupTwoPeers } from "../../helpers/session";

test.describe("Connection resilience", () => {
  test("peer disconnect causes host to return to 1/2 peers", async ({ browser }) => {
    const { ctxA, ctxB, pageA } = await setupTwoPeers(browser);
    try {
      await expect(pageA.locator("text=2/2").first()).toBeVisible({ timeout: 10_000 });
      await ctxB.close();
      await expect(pageA.locator("text=1/2").first()).toBeVisible({ timeout: 10_000 });
      await expect(pageA.locator("text=Establish Direct Connection")).toHaveCount(0);
    } finally {
      await ctxA.close();
    }
  });

  test("host disconnect leaves guest without active-session controls", async ({ browser }) => {
    const { ctxA, ctxB, pageB } = await setupTwoPeers(browser);
    try {
      await expect(pageB.locator("text=2/2").first()).toBeVisible({ timeout: 10_000 });
      await ctxA.close();
      await expect(pageB.locator("text=1/2").first()).toBeVisible({ timeout: 10_000 });
      await expect(pageB.locator('button:has-text("Transfer Host")')).toHaveCount(0);
    } finally {
      await ctxB.close();
    }
  });
});
