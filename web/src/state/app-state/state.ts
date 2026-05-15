import type {
	AppState,
	SessionState,
	WebRTCConnectionState,
	WebSocketConnectionState
} from "../types";

import { AppStateStore } from "./store";

import {
	DEFAULT_SESSION_STATE,
	DEFAULT_WEBRTC_STATE,
	DEFAULT_WEBSOCKET_STATE
} from "@/config/constants";

const initialState: AppState = {
	sessionState: DEFAULT_SESSION_STATE,
	webrtcState: DEFAULT_WEBRTC_STATE,
	websocketState: DEFAULT_WEBSOCKET_STATE
};

export const appState = new AppStateStore(initialState);

export function getSessionState(): SessionState {
	return appState.get().sessionState;
}

export function getWebRTCState(): WebRTCConnectionState {
	return appState.get().webrtcState;
}

export function getWebsocketState(): WebSocketConnectionState {
	return appState.get().websocketState;
}

export type AppFeature = "auto_webrtc" | "file_transfer_capacity" | "encryption_mode";

export function isAppFeatureEnabled(feature: AppFeature): boolean {
	const { sessionState } = appState.get();

	switch (feature) {
		case "auto_webrtc":
			return sessionState.autoWebRTC;
		case "file_transfer_capacity":
			return sessionState.fileTransferCapacity > 0;
		case "encryption_mode":
			return sessionState.encryptionMode !== "none";
	}
}

export function isWebSocketConnected(): boolean {
	const { websocketState } = appState.get();

	if (websocketState.ws === null) {
		return false;
	}

	if (websocketState.ws.readyState !== WebSocket.OPEN) {
		return false;
	}

	return websocketState.isConnected;
}

export function isWebRtcConnected(): boolean {
	const { webrtcState } = appState.get();

	if (webrtcState.dataChannel === null) {
		return false;
	}

	if (webrtcState.dataChannel.readyState !== "open") {
		return false;
	}

	return webrtcState.isConnected;
}
