import { test, expect } from "@playwright/test";
import { setupTwoPeers, establishDirectConnection } from "../../helpers/session";
import { createTmpFile, cleanupTmpDir, uploadFiles, waitForFileStatus } from "../../helpers/files";

test.describe("File transfer: real end-to-end", () => {
	test.afterEach(() => {
		cleanupTmpDir();
	});

	test("host sends file to guest over direct connection", async ({ browser }) => {
		const { ctxA, ctxB, pageA, pageB } = await setupTwoPeers(browser);
		const fileName = "transfer-basic.txt";
		const filePath = createTmpFile(fileName, 4096, 0x7a);

		try {
			await establishDirectConnection(pageA, pageB);

			await uploadFiles(pageA, [filePath]);
			await expect(pageA.locator(`text=${fileName}`).first()).toBeVisible({ timeout: 10_000 });
			await pageA.click('button:has-text("Send")');

			await waitForFileStatus(pageA, fileName, "sent", 30_000);
			await expect(pageA.getByRole("row", { name: new RegExp(`${fileName}.*error`, "i") })).toHaveCount(
				0
			);
			await expect(pageB.locator("text=WebRTC").first()).toBeVisible({ timeout: 10_000 });
		} finally {
			await ctxA.close();
			await ctxB.close();
		}
	});
});
