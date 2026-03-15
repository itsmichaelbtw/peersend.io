import { test, expect } from "@playwright/test";
import { BASE_URL, openCreateSession, createSession, joinSession } from "../../helpers/session";

test.describe("Chromium compatibility", () => {
  test("app renders without runtime errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(BASE_URL);
    await page.waitForSelector("#root", { state: "attached" });
    await page.waitForTimeout(500);
    expect(errors.filter((e) => !e.includes("favicon"))).toEqual([]);
  });

  test("/session/create stays on app flow (no compatibility redirect)", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/create`);
    await page.waitForSelector("#root", { state: "attached" });
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain("/compatibility");
    await expect(page.locator("text=Create a session")).toBeVisible();
  });

  test("host and peer can enter the same session", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await openCreateSession(pageA);
      const code = await createSession(pageA);
      await pageA.click('button:has-text("Enter")');
      await joinSession(pageB, code);

      await expect(pageA.locator("text=/2\\/2/").first()).toBeVisible({ timeout: 10_000 });
      await expect(pageB.locator("text=/2\\/2/").first()).toBeVisible({ timeout: 10_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
