import type { SessionState, WebRTCConnectionState, WebSocketConnectionState } from "@/state";

export const SESSION_CODE_EXAMPLE = import.meta.env.VITE_SESSION_CODE_EXAMPLE as string;
export const WEBSOCKET_ENDPOINT = import.meta.env.VITE_SERVER_ENDPOINT as string;
export const SESSION_CODE_LENGTH = 5;

export const NODE_ENV = import.meta.env.MODE || "development";

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

export const DEFAULT_WEBSOCKET_STATE: WebSocketConnectionState = {
	ws: null,
	isConnected: false,
	isConnecting: false
};

export const DEFAULT_WEBRTC_STATE: WebRTCConnectionState = {
	dataChannel: null,
	peerConnection: null,
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
