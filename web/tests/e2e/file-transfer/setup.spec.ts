import { test, expect } from "@playwright/test";
import { setupTwoPeers } from "../../helpers/session";

test.describe("File transfer: session setup", () => {
  test("host sees Establish Direct Connection card", async ({ browser }) => {
    const { ctxA, ctxB, pageA } = await setupTwoPeers(browser);
    try {
      await expect(pageA.locator("text=Establish Direct Connection")).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("guest sees Standby card while waiting for host", async ({ browser }) => {
    const { ctxA, ctxB, pageB } = await setupTwoPeers(browser);
    try {
      await expect(pageB.locator("text=Standby")).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("connection type shows Server Connection badge", async ({ browser }) => {
    const { ctxA, ctxB, pageA } = await setupTwoPeers(browser);
    try {
      await expect(pageA.locator("text=Server Connection")).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
