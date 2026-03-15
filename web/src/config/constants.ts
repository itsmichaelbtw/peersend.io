import type { SessionState, WebRTCConnectionState, WebSocketConnectionState } from "@/state";
import type { EnvironmentVariables } from "@/types/env";

export const envVar: EnvironmentVariables = {
	SESSION_CODE_EXAMPLE: import.meta.env.VITE_SESSION_CODE_EXAMPLE as string,
	SESSION_CODE_LENGTH: 5,
	WEBSOCKET_ENDPOINT: import.meta.env.VITE_SERVER_ENDPOINT as string,
	NODE_ENV: import.meta.env.MODE || "development",
	IS_DEVELOPMENT: import.meta.env.DEV,
	IS_PRODUCTION: import.meta.env.PROD,
	LOG_LEVEL: (import.meta.env.VITE_LOG_LEVEL as string) || "info"
};

export const DEFAULT_WEBSOCKET_STATE: WebSocketConnectionState = {
	ws: null,
	isConnected: false,
	isConnecting: false
};

export const DEFAULT_WEBRTC_STATE: WebRTCConnectionState = {
	dataChannel: null,
	isConnected: false,
	isConnecting: false
};

export const DEFAULT_SESSION_STATE: SessionState = {
	sessionCode: null,
	clients: [],
	isHost: false,
	isConnected: false,
	autoWebRTC: false,
	clientId: null,
	maximumClients: 0,
	latency: -1,
	lastError: null,
	encryptionMode: "none",
	connectionType: "none"
};
