import { test, expect } from "@playwright/test";
import { createSession, openCreateSession, setupTwoPeers, waitForPeerCount } from "../../helpers/session";

test.describe("Host transfer", () => {
	test("transfer host moves host controls to the other peer", async ({ browser }) => {
		const { ctxA, ctxB, pageA, pageB } = await setupTwoPeers(browser);

		try {
			await expect(pageA.locator('button:has-text("Transfer Host")')).toBeVisible({ timeout: 10_000 });
			await expect(pageB.locator('button:has-text("Transfer Host")')).toHaveCount(0);

			await pageA.click('button:has-text("Transfer Host")');

			await expect(pageA.locator('button:has-text("Transfer Host")')).toHaveCount(0, { timeout: 10_000 });
			await expect(pageB.locator('button:has-text("Transfer Host")')).toBeVisible({ timeout: 10_000 });
		} finally {
			await ctxA.close();
			await ctxB.close();
		}
	});

	test("non-host cannot transfer host", async ({ browser }) => {
		const { ctxA, ctxB, pageA, pageB } = await setupTwoPeers(browser);

		try {
			await expect(pageA.locator('button:has-text("Transfer Host")')).toBeVisible({ timeout: 10_000 });
			await expect(pageB.locator('button:has-text("Transfer Host")')).toHaveCount(0);

			// Non-host has no transfer affordance, so ownership controls remain with current host.
			await pageB.keyboard.press("Tab");
			await expect(pageA.locator('button:has-text("Transfer Host")')).toBeVisible({ timeout: 5_000 });
			await expect(pageB.locator('button:has-text("Transfer Host")')).toHaveCount(0);
		} finally {
			await ctxA.close();
			await ctxB.close();
		}
	});

	test("host cannot transfer when no other client is connected", async ({ browser }) => {
		const { ctxA, ctxB, pageA } = await setupTwoPeers(browser);

		try {
			await expect(pageA.locator('button:has-text("Transfer Host")')).toBeVisible({ timeout: 10_000 });

			await ctxB.close();
			await waitForPeerCount(pageA, 1, 2, 20_000);
			await expect(pageA.locator('button:has-text("Transfer Host")')).toHaveCount(0);
		} finally {
			await ctxA.close();
		}
	});

	test("single host session never exposes transfer host control", async ({ browser }) => {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();

		try {
			await openCreateSession(page);
			await createSession(page);
			await page.click('button:has-text("Enter")');
			await page.waitForURL(/\/session\/[A-Z0-9-]+$/, { timeout: 10_000 });
			await waitForPeerCount(page, 1, 2, 10_000);
			await expect(page.locator('button:has-text("Transfer Host")')).toHaveCount(0);
		} finally {
			await ctx.close();
		}
	});
});
