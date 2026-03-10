import { test, expect } from "@playwright/test";
import { setupTwoPeers } from "../../helpers/session";

test.describe("Connection resilience", () => {
  test("peer disconnect causes other peer to update client count", async ({ browser }) => {
    const { ctxA, ctxB, pageA } = await setupTwoPeers(browser);
    try {
      await ctxB.close();
      await expect(
        pageA.locator("text=/1\\/2/").first().or(pageA.locator("text=Create a session"))
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await ctxA.close();
    }
  });
});
