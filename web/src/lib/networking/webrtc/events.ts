import type { WebRtcEventMap, WebRtcMessages } from "./types";
import type { NetworkEvents } from "../types";

import { updateState } from "@/state/app-state";
import { webrtcClient } from "./client";

function event_pong(data: WebRtcEventMap.IncomingEvents["pong"]) {
  webrtcClient.latency_checker.pong(data);
}

function event_ping(data: WebRtcEventMap.IncomingEvents["ping"]) {
  webrtcClient.emit({
    type: "pong",
    data: {
      client_timestamp: data.client_timestamp,
      server_timestamp: Date.now()
    }
  });
}

function event_error(data: WebRtcEventMap.IncomingEvents["error"]) {
  updateState({
    sessionState: {
      lastError: {
        title: data.type,
        message: data.reason
      }
    },
    websocketState: {
      isConnecting: false
    },
    webrtcState: {
      isConnecting: false
    }
  });
}

export const events: NetworkEvents<WebRtcMessages.IncomingMessage> = {
  file_transit: () => {},
  pong: event_pong,
  ping: event_ping,
  error: event_error
};
