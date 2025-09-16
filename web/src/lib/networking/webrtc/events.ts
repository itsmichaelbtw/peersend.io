import type { WebRtcEventMap, WebRtcMessages } from "./types";
import type { NetworkEvents } from "../types";

import { appState, fileTransferState } from "@/state";
import { webrtcClient } from "./client";

function event_start_file_transit(data: WebRtcEventMap.IncomingEvents["start_file_transit"]) {
  // need to move file transfer to an external store
  // since we need to add them here
  // fileTransferState.add([data]);
}

function event_in_file_transit(data: WebRtcEventMap.IncomingEvents["in_file_transit"]) {}

function event_end_file_transit(data: WebRtcEventMap.IncomingEvents["end_file_transit"]) {}

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
  appState.dispatch("SET_LAST_ERROR", {
    title: data.type,
    message: data.reason
  });
}

export const events: NetworkEvents<WebRtcMessages.IncomingMessage> = {
  start_file_transit: event_start_file_transit,
  in_file_transit: console.log,
  end_file_transit: console.log,
  pong: event_pong,
  ping: event_ping,
  error: event_error
};
