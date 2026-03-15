import { test, expect } from "@playwright/test";
import { setupTwoPeers, BASE_URL } from "../../helpers/session";

test.describe("Session capacity", () => {
	test("third client cannot join a full session", async ({ browser }) => {
		const { ctxA, ctxB, sessionCode } = await setupTwoPeers(browser);
		const ctxC = await browser.newContext();
		const pageC = await ctxC.newPage();

		try {
			await pageC.goto(`${BASE_URL}/session/join`);
			await pageC.locator("input").first().fill(sessionCode);
			await pageC.click('button:has-text("Enter")');
			await expect(
				pageC
					.locator(".mantine-Notification-root")
					.or(pageC.locator("[role='alert']"))
					.or(pageC.locator("text=/full|session may be full|unable to join/i"))
					.first()
			).toBeVisible({ timeout: 10_000 });
		} finally {
			await ctxA.close();
			await ctxB.close();
			await ctxC.close();
		}
	});
});
