import { getWebRTCClient, getWebSocketClient } from "./client-registry";

/**
 * Tears down the active session by disconnecting WebRTC then WebSocket.
 * Both client reset() methods handle clearing file transfer state and storage,
 * so this function is the single entry point for any full session teardown.
 *
 * Safe to call when already disconnected — all steps are no-ops if the
 * connection is not active.
 */
export function teardownSession(): void {
	getWebRTCClient().disconnect();
	getWebSocketClient().disconnect();
}
