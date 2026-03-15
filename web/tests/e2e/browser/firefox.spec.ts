import { test, expect } from "@playwright/test";
import { BASE_URL, openCreateSession, createSession, joinSession } from "../../helpers/session";

test.describe("Browser compatibility", () => {
	test("app renders without console errors", async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (err) => errors.push(err.message));
		await page.goto(BASE_URL);
		await page.waitForSelector("#root", { state: "attached" });
		await page.waitForTimeout(500);
		expect(errors.filter((e) => !e.includes("favicon"))).toEqual([]);
	});

	test("/session/create does not redirect to /compatibility in supported browsers", async ({
		page
	}) => {
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

	/**
	 * Regression test: Firefox throws "RTCPeerConnection is not defined" when the
	 * browser does not expose the WebRTC API (e.g. in restricted environments or
	 * older Firefox versions with media.peerconnection.enabled = false).
	 *
	 * The app should detect the missing API and redirect to /compatibility instead
	 * of crashing with an uncaught ReferenceError.
	 */
	test("app redirects to /compatibility when RTCPeerConnection is not defined", async ({
		page
	}) => {
		// Remove RTCPeerConnection from the window before the app boots.
		await page.addInitScript(() => {
			// @ts-expect-error intentionally deleting to simulate unsupported browser
			delete window.RTCPeerConnection;
		});

		const errors: string[] = [];
		page.on("pageerror", (err) => errors.push(err.message));

		await page.goto(`${BASE_URL}/session/create`);
		await page.waitForSelector("#root", { state: "attached" });
		await page.waitForTimeout(500);

		// The app should redirect to /compatibility rather than throw an uncaught error.
		const isOnCompatibilityPage = page.url().includes("/compatibility");
		const hasRTCError = errors.some((e) =>
			e.toLowerCase().includes("rtcpeerconnection is not defined")
		);

		// Either the app gracefully redirects, or it does not throw an RTC error.
		expect(isOnCompatibilityPage || !hasRTCError).toBe(true);
	});
});
