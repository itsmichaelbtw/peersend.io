import type { StateUpdate } from "@/state/store";
import type { AppState, ConnectionErrorData } from "@/types/state";

import { createStateStore } from "./store";

import {
  DEFAULT_SESSION_STATE,
  DEFAULT_WEBRTC_STATE,
  DEFAULT_WEBSOCKET_STATE
} from "@/config/constants";

const initialState = {
  sessionState: DEFAULT_SESSION_STATE,
  webrtcState: DEFAULT_WEBRTC_STATE,
  websocketState: DEFAULT_WEBSOCKET_STATE
};

export const appState = createStateStore(initialState);

export function getAppState() {
  return appState.get();
}

export function getSessionState() {
  return getAppState().sessionState;
}

export function getWebrtcState() {
  return getAppState().webrtcState;
}

export function getWebsocketState() {
  return getAppState().websocketState;
}

export function updateState(state: StateUpdate<AppState>) {
  const current = getAppState();
  const next: AppState = { ...current };

  for (const key in state) {
    if (state.hasOwnProperty(key)) {
      // @ts-ignore
      next[key] = { ...current[key], ...state[key] };
    }
  }

  appState.set(next);
}

export function isWebSocketConnected() {
  const { websocketState } = getAppState();

  if (websocketState.ws == null) {
    return null;
  }

  if (websocketState.ws.readyState !== WebSocket.OPEN) {
    return false;
  }

  return websocketState.isConnected;
}

export function isWebRtcConnected() {
  const { webrtcState } = getAppState();

  if (webrtcState.dataChannel == null || webrtcState.peerConnection == null) {
    return false;
  }

  if (webrtcState.dataChannel.readyState !== "open") {
    return false;
  }

  return webrtcState.isConnected;
}

export function handleSessionError(error: ConnectionErrorData) {
  // console.error("Session error:", error.title, error.message);

  updateState({
    sessionState: {
      lastError: error
    }
  });
}
