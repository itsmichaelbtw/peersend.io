import { fileTransferState } from "@/state/file-transfer-state";
import { fileStorage } from "./file-storage";

/**
 * Clears all file transfer state and storage. Called on full session teardown
 * (WebSocket disconnect) when the session is gone entirely.
 */
export function resetFileTransfers(): void {
	fileStorage.reset();
	fileTransferState.dispatch("BULK_SET_FILES", []);
}
