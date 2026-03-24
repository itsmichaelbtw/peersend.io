/**
 * Shared session helpers for E2E tests.
 * Provides reusable flows for creating, joining, and setting up peer sessions.
 */

import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

export const BASE_URL = (process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3501").replace(/\/$/, "");

/** Navigate to /session/create and wait for the app to mount. */
export async function openCreateSession(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/session/create`);
  await page.waitForSelector("#root", { state: "attached" });
  await expect(page.locator("text=Create a session")).toBeVisible({ timeout: 10_000 });
}

/** Click "Create session" and return the session code. */
export async function createSession(page: Page): Promise<string> {
  await page.click('button:has-text("Create session")');
  const codeEl = page.locator(".font-mono");
  await codeEl.waitFor({ timeout: 10_000 });
  return ((await codeEl.textContent()) ?? "").trim();
}

/** Join a session from a separate page using the given code. */
export async function joinSession(page: Page, code: string): Promise<void> {
  await page.goto(`${BASE_URL}/session/join`);
  await page.waitForSelector("#root", { state: "attached" });
  await page.locator("input").first().fill(code);
  await page.click('button:has-text("Enter")');
  await page.waitForURL(/\/session\/[A-Z0-9-]+$/, { timeout: 10_000 });
}

/** Wait until the page shows the active session view. */
export async function waitForActiveSession(page: Page): Promise<void> {
  await page.waitForURL(/\/session\/[A-Z0-9-]+$/, { timeout: 10_000 });
}

/** Assert that peers connected count renders as N/M in the connection panel. */
export async function waitForPeerCount(
  page: Page,
  connected: number,
  max: number,
  timeout = 10_000
): Promise<void> {
  await expect(page.locator(`text=${connected}/${max}`).first()).toBeVisible({ timeout });
}

/** Host flow to upgrade to WebRTC and wait until both peers report direct connection. */
export async function establishDirectConnection(hostPage: Page, guestPage: Page): Promise<void> {
  await expect(hostPage.locator("text=Establish Direct Connection")).toBeVisible({ timeout: 10_000 });
  await hostPage.click('button:has-text("Establish Connection")');
  await expect(hostPage.locator('button:has-text("Upgrade connection")')).toBeVisible({
    timeout: 10_000
  });
  await hostPage.click('button:has-text("Upgrade connection")');
  await expect(hostPage.locator("text=Connection Upgraded Successfully!")).toBeVisible({
    timeout: 20_000
  });
  await hostPage.click('button:has-text("Close")');

  await expect(hostPage.locator("text=WebRTC").first()).toBeVisible({ timeout: 10_000 });
  await expect(guestPage.locator("text=WebRTC").first()).toBeVisible({ timeout: 10_000 });
  await expect(hostPage.locator("text=File Transfer")).toBeVisible({ timeout: 10_000 });
  await expect(guestPage.locator("text=File Transfer")).toBeVisible({ timeout: 10_000 });
}

/** Set up two connected peers and wait for both to show 2/2 connected. */
export async function setupTwoPeers(browser: Browser): Promise<{
  ctxA: BrowserContext;
  ctxB: BrowserContext;
  pageA: Page;
  pageB: Page;
  sessionCode: string;
}> {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await openCreateSession(pageA);
  const sessionCode = await createSession(pageA);
  await pageA.click('button:has-text("Enter")');
  await pageA.waitForURL(/\/session\/[A-Z0-9-]+$/, { timeout: 10_000 });

  await joinSession(pageB, sessionCode);

  await expect(pageA.locator("text=/2\\/2/").first()).toBeVisible({ timeout: 10_000 });
  await expect(pageB.locator("text=/2\\/2/").first()).toBeVisible({ timeout: 10_000 });

  return { ctxA, ctxB, pageA, pageB, sessionCode };
}
