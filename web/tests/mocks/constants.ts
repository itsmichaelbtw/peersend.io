/**
 * Mock for @/config/constants.
 *
 * Prevents import.meta.env access when running unit tests in the Playwright
 * Node.js runner, where Vite's environment variable injection is unavailable.
 */

export const envVar = {
	SESSION_CODE_EXAMPLE: "ABCDE",
	SESSION_CODE_LENGTH: 5,
	WEBSOCKET_ENDPOINT: "ws://localhost:3600",
	NODE_ENV: "test",
	IS_DEVELOPMENT: false,
	IS_PRODUCTION: false,
	LOG_LEVEL: "error"
};

export const DEFAULT_WEBSOCKET_STATE = {
	ws: null,
	isConnected: false,
	isConnecting: false
};

export const DEFAULT_WEBRTC_STATE = {
	dataChannel: null,
	peerConnection: null,
	isConnected: false,
	isConnecting: false
};

export const DEFAULT_SESSION_STATE = {
	sessionCode: null,
	clients: [],
	isHost: false,
	isConnected: false,
	autoWebRTC: false,
	clientId: null,
	maximumClients: 0,
	latency: -1,
	lastError: null,
	encryptionMode: "none" as const,
	connectionType: "none" as const
};
