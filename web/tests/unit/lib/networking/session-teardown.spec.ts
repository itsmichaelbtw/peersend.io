/**
 * Unit tests for teardownSession().
 *
 * teardownSession() is the canonical function for ending an active session.
 * It disconnects WebRTC and WebSocket clients in order, and as a side-effect
 * of each client's reset() both fileTransferState and fileStorage are cleared.
 *
 * Tests verify that after calling teardownSession():
 * - fileTransferState.get().files is emptied
 * - fileStorage no longer holds records for any previously stored file
 * - the function is safe to call when already disconnected (idempotent)
 * - the function does not throw when called multiple times
 */

import { test, expect } from "@playwright/test";
import { fileTransferState } from "@/state/file-transfer-state";
import { fileStorage } from "@/lib/file-transfer/file-storage";
import { teardownSession } from "@/lib/networking/session-teardown";
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

test.describe("teardownSession()", () => {
	test("clears fileTransferState.files after teardown", () => {
		fileTransferState.dispatch("BULK_ADD_FILES", [makePeerSendFile("f1"), makePeerSendFile("f2")]);
		expect(fileTransferState.get().files).toHaveLength(2);

		teardownSession();

		expect(fileTransferState.get().files).toHaveLength(0);
	});

	test("clears fileStorage records after teardown", () => {
		fileStorage.init("f1", 100);
		expect(fileStorage.has("f1")).toBe(true);

		teardownSession();

		expect(fileStorage.has("f1")).toBe(false);
	});

	test("does not throw when called with no active connection", () => {
		expect(() => teardownSession()).not.toThrow();
	});

	test("is idempotent — calling multiple times does not throw", () => {
		expect(() => {
			teardownSession();
			teardownSession();
			teardownSession();
		}).not.toThrow();
	});

	test("leaves fileTransferState empty after multiple calls", () => {
		fileTransferState.dispatch("BULK_ADD_FILES", [makePeerSendFile("f1")]);
		teardownSession();
		teardownSession();

		expect(fileTransferState.get().files).toHaveLength(0);
	});
});
