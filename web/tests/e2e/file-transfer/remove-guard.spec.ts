import { test, expect } from "@playwright/test";
import { setupTwoPeers, establishDirectConnection } from "../../helpers/session";
import { createTmpFile, cleanupTmpDir, uploadFiles } from "../../helpers/files";

test.describe("File transfer: remove guard during in-transit", () => {
	test.afterEach(() => {
		cleanupTmpDir();
	});

	test("Clear button is disabled while file is in-transit", async ({ browser }) => {
		const { ctxA, ctxB, pageA, pageB } = await setupTwoPeers(browser);
		// 3 MB file to ensure a measurable in-transit window
		const filePath = createTmpFile("remove-guard-large.bin", 3 * 1024 * 1024);

		try {
			await establishDirectConnection(pageA, pageB);
			await uploadFiles(pageA, [filePath]);
			await expect(pageA.locator("text=remove-guard-large.bin").first()).toBeVisible({
				timeout: 10_000
			});

			await pageA.click('button:has-text("Send")');

			await expect(pageA.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 10_000 });
			await expect(pageA.locator('button:has-text("Clear")').first()).toBeDisabled();
			await expect(pageA.locator('button:has-text("Clear")').first()).toBeEnabled({
				timeout: 30_000
			});
		} finally {
			await ctxA.close();
			await ctxB.close();
		}
	});

	test("in-transit row checkbox is disabled and cannot be selected", async ({ browser }) => {
		const { ctxA, ctxB, pageA, pageB } = await setupTwoPeers(browser);
		const filePath = createTmpFile("selection-guard.bin", 3 * 1024 * 1024);

		try {
			await establishDirectConnection(pageA, pageB);
			await uploadFiles(pageA, [filePath]);
			await expect(pageA.locator("text=selection-guard.bin").first()).toBeVisible({
				timeout: 10_000
			});

			await pageA.click('button:has-text("Send")');

			await expect(pageA.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 10_000 });

			await expect(pageA.locator('input[type="checkbox"]').nth(1)).toBeDisabled();

			await expect(pageA.locator('table [role="progressbar"]')).toHaveCount(0, { timeout: 30_000 });
			await expect(pageA.locator('input[type="checkbox"]').nth(1)).toBeEnabled();
		} finally {
			await ctxA.close();
			await ctxB.close();
		}
	});

	test("store remove() silently ignores in-transit files", async ({ browser }) => {
		// Verifies defense-in-depth: even if the UI guard is bypassed, the store
		// will not remove in-transit files.
		const { ctxA, ctxB, pageA, pageB } = await setupTwoPeers(browser);
		const filePath = createTmpFile("store-guard.bin", 3 * 1024 * 1024);

		try {
			await establishDirectConnection(pageA, pageB);
			await uploadFiles(pageA, [filePath]);
			await expect(pageA.locator("text=store-guard.bin").first()).toBeVisible({ timeout: 10_000 });

			await pageA.click('button:has-text("Send")');

			await expect(pageA.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 10_000 });
			await expect(pageA.locator("text=store-guard.bin").first()).toBeVisible();

			await expect(pageA.getByRole("row", { name: /store-guard\.bin.*sent/i })).toBeVisible({
				timeout: 30_000
			});
		} finally {
			await ctxA.close();
			await ctxB.close();
		}
	});
});
