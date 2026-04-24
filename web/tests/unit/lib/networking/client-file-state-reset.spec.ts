/**
 * Unit tests for WebSocketClient.reset() and WebRTCClient.reset() file state clearing.
 *
 * After a session ends — whether cleanly or due to an unexpected server close —
 * both clients must clear fileTransferState and fileStorage so stale file
 * records do not persist into the next session.
 *
 * These tests exercise the clients via the singleton instances returned by the
 * registry (matching the runtime behaviour), using default (disconnected) state
 * so no real network connections are attempted.
 */

import { test, expect } from "@playwright/test";
import { fileTransferState } from "@/state/file-transfer-state";
import { fileStorage } from "@/lib/file-transfer/file-storage";
import { getWebSocketClient, getWebRTCClient } from "@/lib/networking/client-registry";
import type { PeerSendFile } from "@/state/types";

function makePeerSendFile(id: string): PeerSendFile {
	return {
		id,
		timestamp: 0,
		status: "pending",
		transfer: { type: "outgoing", percentage: 0 },
		metadata: { name: "test.txt", path: "", size: 100, type: "text/plain", lastModified: 0 },
		nativeFile: null
	};
}

test.afterEach(() => {
	fileTransferState.dispatch("BULK_SET_FILES", []);
	fileStorage.reset();
});

test.describe("WebSocketClient.reset() — file state", () => {
	test("clears fileTransferState.files", () => {
		fileTransferState.dispatch("BULK_ADD_FILES", [makePeerSendFile("ws-f1"), makePeerSendFile("ws-f2")]);
		expect(fileTransferState.get().files).toHaveLength(2);

		getWebSocketClient().reset();

		expect(fileTransferState.get().files).toHaveLength(0);
	});

	test("clears fileStorage records", () => {
		fileStorage.init("ws-chunk-1", 50);
		expect(fileStorage.has("ws-chunk-1")).toBe(true);

		getWebSocketClient().reset();

		expect(fileStorage.has("ws-chunk-1")).toBe(false);
	});

	test("does not throw when file state is already empty", () => {
		expect(fileTransferState.get().files).toHaveLength(0);
		expect(() => getWebSocketClient().reset()).not.toThrow();
	});
});

test.describe("WebRTCClient.reset() — file state", () => {
	test("does not modify file state on reset", () => {
		fileTransferState.dispatch("BULK_ADD_FILES", [
			{ ...makePeerSendFile("rtc-f1"), status: "sent" },
			{ ...makePeerSendFile("rtc-f2"), status: "in-transit" }
		]);

		getWebRTCClient().reset();

		const files = fileTransferState.get().files;
		expect(files).toHaveLength(2);
		expect(files.find((f) => f.id === "rtc-f1")?.status).toBe("sent");
		expect(files.find((f) => f.id === "rtc-f2")?.status).toBe("in-transit");
	});

	test("does not clear fileStorage on reset", () => {
		fileStorage.init("rtc-chunk-1", 50);
		expect(fileStorage.has("rtc-chunk-1")).toBe(true);

		getWebRTCClient().reset();

		expect(fileStorage.has("rtc-chunk-1")).toBe(true);
	});

	test("does not throw when file state is already empty", () => {
		expect(fileTransferState.get().files).toHaveLength(0);
		expect(() => getWebRTCClient().reset()).not.toThrow();
	});
});
