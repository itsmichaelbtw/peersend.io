import type { WebRtcClient } from "./webrtc";
import type { WebSocketClient } from "./websocket";

import { webrtcClient } from "./webrtc";
import { webSocketClient } from "./websocket";

export interface NetworkClients {
  wrtc: WebRtcClient;
  ws: WebSocketClient;
}

export function getNetworkingClients(): NetworkClients {
  return {
    wrtc: webrtcClient,
    ws: webSocketClient
  };
}
