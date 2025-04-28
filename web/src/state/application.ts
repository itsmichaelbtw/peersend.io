import type { ApplicationState } from "@/types/state";
import type { WebSocketConnectionState, IncomingWebSocketMessageType } from "@/types/websocket";
import type { WebRTCConnectionState, IncomingWebRTCMessageType } from "@/types/webrtc";

import { reactive } from "vue";

export const DEFAULT_WEBSOCKET_STATE: WebSocketConnectionState = {
  ws: null,
  is_connected: false,
  is_connecting: false
};

export const DEFAULT_WEBRTC_STATE: WebRTCConnectionState = {
  dataChannel: null,
  peerConnection: null,
  is_connected: false,
  is_connecting: false
};

export const DEFAULT_APPLICATION_STATE: ApplicationState = {
  session_code: null,
  clients: [],
  is_host: false,
  is_connected: false,
  auto_webrtc: false,
  client_id: null,
  maximum_clients: 0,
  latency: -1,
  last_error: null,
  encryption_mode: "none",
  connection_type: "none"
};

export const applicationState = reactive<ApplicationState>(
  structuredClone(DEFAULT_APPLICATION_STATE)
);
export const socketState = reactive<WebSocketConnectionState>(
  structuredClone(DEFAULT_WEBSOCKET_STATE)
);
export const rtcState = reactive<WebRTCConnectionState>(structuredClone(DEFAULT_WEBRTC_STATE));

export function flagApplicationError(
  message: string,
  type: IncomingWebSocketMessageType | IncomingWebRTCMessageType = "error"
) {
  applicationState.last_error = {
    type: type,
    data: {
      message: message
    }
  };
}
