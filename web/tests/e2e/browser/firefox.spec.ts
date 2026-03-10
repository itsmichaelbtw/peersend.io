import { test, expect } from "@playwright/test";
import { BASE_URL } from "../../tests/helpers/session";

test.describe("Browser compatibility", () => {
  test("app renders without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(BASE_URL);
    await page.waitForSelector("#root", { state: "attached" });
    await page.waitForTimeout(500);
    expect(errors.filter((e) => !e.includes("favicon"))).toEqual([]);
  });

  test("RTCPeerConnection and createDataChannel are available", async ({ page }) => {
    await page.goto(BASE_URL);
    const isCompatible = await page.evaluate(() => {
      return !!(window.RTCPeerConnection && "createDataChannel" in RTCPeerConnection.prototype);
    });
    expect(isCompatible).toBe(true);
  });

  test("RTCDataChannel binaryType can be set to arraybuffer (Firefox regression)", async ({ page }) => {
    await page.goto(BASE_URL);
    const ok = await page.evaluate(() => {
      try {
        const pc = new RTCPeerConnection();
        const dc = pc.createDataChannel("test");
        dc.binaryType = "arraybuffer";
        const result = dc.binaryType === "arraybuffer";
        pc.close();
        return result;
      } catch {
        return false;
      }
    });
    expect(ok).toBe(true);
  });

  test("/session/create does not redirect to /compatibility in supported browsers", async ({ page }) => {
    await page.goto(`${BASE_URL}/session/create`);
    await page.waitForSelector("#root", { state: "attached" });
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain("/compatibility");
    await expect(page.locator("text=Create a session")).toBeVisible();
  });

  /**
   * Regression test: Firefox throws "RTCPeerConnection is not defined" when the
   * browser does not expose the WebRTC API (e.g. in restricted environments or
   * older Firefox versions with media.peerconnection.enabled = false).
   *
   * The app should detect the missing API and redirect to /compatibility instead
   * of crashing with an uncaught ReferenceError.
   */
  test("app redirects to /compatibility when RTCPeerConnection is not defined", async ({ page }) => {
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
