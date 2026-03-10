import { test, expect } from "@playwright/test";
import { openCreateSession, createSession, waitForActiveSession } from "../../helpers/session";

test.describe("Session creation", () => {
  test("creates a session and displays a valid session code", async ({ page }) => {
    await openCreateSession(page);
    const code = await createSession(page);
    expect(code).toMatch(/^X-[A-Z0-9]{6}$/);
  });

  test("shows session details after creation", async ({ page }) => {
    await openCreateSession(page);
    await createSession(page);
    await expect(page.locator("text=Session details")).toBeVisible();
    await expect(page.locator("text=Maximum connections:")).toBeVisible();
  });

  test("shows client count of 1/N after creation", async ({ page }) => {
    await openCreateSession(page);
    await createSession(page);
    await expect(page.locator("text=/1\\/\\d+ connected/")).toBeVisible();
  });

  test("Enter button navigates to active session", async ({ page }) => {
    await openCreateSession(page);
    await createSession(page);
    await page.click('button:has-text("Enter")');
    await waitForActiveSession(page);
  });
});
