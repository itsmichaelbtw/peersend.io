import { test, expect } from "@playwright/test";
import { setupTwoPeers, establishDirectConnection, waitForPeerCount } from "../../helpers/session";

test.describe("File transfer: session setup", () => {
  test("host sees direct-connection CTA when second peer joins", async ({ browser }) => {
    const { ctxA, ctxB, pageA } = await setupTwoPeers(browser);
    try {
      await expect(pageA.locator("text=Establish Direct Connection")).toBeVisible({ timeout: 5_000 });
      await expect(pageA.locator('button:has-text("Transfer Host")')).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("guest sees standby card until host upgrades connection", async ({ browser }) => {
    const { ctxA, ctxB, pageB } = await setupTwoPeers(browser);
    try {
      await expect(pageB.locator("text=Standby")).toBeVisible({ timeout: 5_000 });
      await expect(pageB.locator("text=Pending Host Action")).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("upgrade flow moves both peers from server to direct connection", async ({ browser }) => {
    const { ctxA, ctxB, pageA, pageB } = await setupTwoPeers(browser);
    try {
      await expect(pageA.locator("text=Server Connection")).toBeVisible({ timeout: 5_000 });
      await waitForPeerCount(pageA, 2, 2);
      await establishDirectConnection(pageA, pageB);
      await expect(pageA.locator("text=Server Connection")).not.toBeVisible();
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
