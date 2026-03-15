import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Buffer } from "node:buffer";
import type { Page } from "@playwright/test";

let tmpDir: string | null = null;

export function getTmpDir(): string {
	if (!tmpDir) {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "peersend-test-"));
	}
	return tmpDir;
}

export function createTmpFile(name: string, sizeBytes: number, fill = 0x42): string {
	const filePath = path.join(getTmpDir(), name);
	fs.writeFileSync(filePath, Buffer.alloc(sizeBytes, fill));
	return filePath;
}

export function cleanupTmpDir(): void {
	if (tmpDir) {
		fs.rmSync(tmpDir, { recursive: true, force: true });
		tmpDir = null;
	}
}

export async function uploadFiles(page: Page, filePaths: string[]): Promise<void> {
	await page.locator('input[type="file"]').first().setInputFiles(filePaths);
}

export async function waitForFileStatus(
	page: Page,
	fileName: string,
	status: string,
	timeout = 30_000
): Promise<void> {
	const { expect } = await import("@playwright/test");
	const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	await expect(
		page.getByRole("row", { name: new RegExp(`${escapedFileName}.*${status}`, "i") })
	).toBeVisible({ timeout });
}
