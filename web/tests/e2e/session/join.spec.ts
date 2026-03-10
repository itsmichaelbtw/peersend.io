import { test, expect, type BrowserContext } from "@playwright/test";
import {
  BASE_URL,
  openCreateSession,
  createSession,
  joinSession,
  setupTwoPeers,
} from "../../helpers/session";

test.describe("Session joining", () => {
  test("join page renders input and Enter button", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/join`);
    await page.waitForSelector("#root", { state: "attached" });
    await expect(page.locator("text=Join a session")).toBeVisible();
    await expect(page.locator('button:has-text("Enter")')).toBeVisible();
  });

  test("empty code shows required validation error", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/join`);
    await page.waitForSelector("#root", { state: "attached" });
    await page.waitForTimeout(400);
    await page.click('button:has-text("Enter")');
    await expect(page.locator("text=A session code is required")).toBeVisible({ timeout: 3_000 });
    expect(page.url()).toContain("/session/join");
  });

  test("malformed code shows format validation error", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/join`);
    await page.waitForSelector("#root", { state: "attached" });
    await page.waitForTimeout(400);
    await page.locator("input").first().fill("bad-code");
    await page.click('button:has-text("Enter")');
    await expect(page.locator("text=/valid session code/i")).toBeVisible({ timeout: 3_000 });
    expect(page.url()).toContain("/session/join");
  });

  test("non-existent session code shows an error", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/join`);
    await page.waitForSelector("#root", { state: "attached" });
    await page.waitForTimeout(400);
    await page.locator("input").first().fill("X-XXXXXX");
    await page.click('button:has-text("Enter")');
    await expect(
      page.locator(".mantine-Notification-root")
        .or(page.locator("[role='alert']"))
        .or(page.locator("text=/session not found|error|invalid/i"))
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("two peers can join the same session and see 2/2 connected", async ({ browser }) => {
    const { ctxA, ctxB, pageA, pageB } = await setupTwoPeers(browser);
    try {
      await expect(pageA.locator("text=/2\\/2/").first()).toBeVisible({ timeout: 5_000 });
      await expect(pageB.locator("text=/2\\/2/").first()).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("host badge is visible after entering active session", async ({ browser }) => {
    const ctx: BrowserContext = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await openCreateSession(page);
      await createSession(page);
      await page.click('button:has-text("Enter")');
      await page.waitForURL(/\/session\/[A-Z0-9\-]+$/, { timeout: 10_000 });
      await expect(page.locator("text=Host").first()).toBeVisible({ timeout: 5_000 });
    } finally {
      await ctx.close();
    }
  });
});
