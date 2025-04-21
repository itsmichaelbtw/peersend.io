import type { ApplicationState } from "@/types/state";
import type { WebSocketConnectionState } from "@/types/websocket";
import type { WebRTCConnectionState } from "@/types/webrtc";

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
  connection_type: "none",
  __protocol: {
    websocket: DEFAULT_WEBSOCKET_STATE,
    rtc: DEFAULT_WEBRTC_STATE
  }
};

export const applicationState = reactive<ApplicationState>(DEFAULT_APPLICATION_STATE);
