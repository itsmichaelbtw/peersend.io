import type { AppState } from "../types";

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

export function getSessionState() {
	return appState.get().sessionState;
}

export function getWebrtcState() {
	return appState.get().webrtcState;
}

export function getWebsocketState() {
	return appState.get().websocketState;
}

export function isWebSocketConnected() {
	const { websocketState } = appState.get();

	if (websocketState.ws === null) {
		return null;
	}

	if (websocketState.ws.readyState !== WebSocket.OPEN) {
		return false;
	}

	return websocketState.isConnected;
}

export function isWebRtcConnected() {
	const { webrtcState } = appState.get();

	if (webrtcState.dataChannel === null || webrtcState.peerConnection === null) {
		return false;
	}

	if (webrtcState.dataChannel.readyState !== "open") {
		return false;
	}

	return webrtcState.isConnected;
}
