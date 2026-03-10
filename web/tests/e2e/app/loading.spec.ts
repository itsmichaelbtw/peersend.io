import { test, expect } from "@playwright/test";
import { BASE_URL } from "../../tests/helpers/session";

test.describe("App loads", () => {
  test("home page renders without JavaScript errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(BASE_URL);
    await page.waitForSelector("#root", { state: "attached" });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test("page title contains peersend", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/peersend/i);
  });

  test("/session/create renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/create`);
    await page.waitForSelector("#root", { state: "attached" });
    await expect(page.locator("text=Create a session")).toBeVisible();
  });

  test("/session/join renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/join`);
    await page.waitForSelector("#root", { state: "attached" });
    await expect(page.locator("text=Join a session")).toBeVisible();
  });

  test("no 404 for CSS resources (regression: broken tailwind.css link)", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (res) => {
      if (res.status() === 404) failed.push(res.url());
    });
    await page.goto(BASE_URL);
    await page.waitForTimeout(500);
    expect(failed.filter((url) => url.includes(".css"))).toEqual([]);
  });
});
