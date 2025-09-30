import type { WebRtcEventMap, WebRtcMessages } from "./types";
import type { NetworkEvents } from "../types";

import { appState, fileTransferState, getPeersendFile } from "@/state";
import {
  fileStorage,
  createCustomFileFromTransfer,
  parseTransitBuffer,
  ProgressThrottler
} from "@/lib/file-transfer";
import { webrtcClient } from "./client";

const throttler = new ProgressThrottler(1, 150);

function event_StartFileTransit(data: WebRtcEventMap.IncomingEvents["start_file_transit"]) {
  if (!!getPeersendFile(data.id)) {
    console.error("a file with the same ID already exists");
    return;
  }

  const file = createCustomFileFromTransfer(data);
  fileStorage.init(data.id, data.transferSize);
  fileTransferState.add([file]);
}

function event_InFileTransit(data: WebRtcEventMap.IncomingEvents["in_file_transit"]) {
  // https://github.com/itsmichaelbtw/peersend.io/issues/37

  const parsed = parseTransitBuffer(data);
  const progress = fileStorage.addChunk(parsed.fileId, parsed.chunk);

  if (throttler.canUpdate(progress)) {
    fileTransferState.dispatch("SET_FILE_PERCENTAGE", {
      id: parsed.fileId,
      percentage: progress
    });
  }
}

function event_EndFileTransit(data: WebRtcEventMap.IncomingEvents["end_file_transit"]) {
  throttler.reset();

  if (fileStorage.isComplete(data.id)) {
    fileTransferState.dispatch("SET_FILE_STATUS", {
      id: data.id,
      status: "received"
    });
  } else {
    fileStorage.remove(data.id);
    fileTransferState.dispatch("SET_FILE_STATUS", {
      id: data.id,
      status: "error"
    });
  }
}

function event_Pong(data: WebRtcEventMap.IncomingEvents["pong"]) {
  webrtcClient.latency_checker.pong(data);
}

function event_Ping(data: WebRtcEventMap.IncomingEvents["ping"]) {
  webrtcClient.emit({
    type: "pong",
    data: {
      client_timestamp: data.client_timestamp,
      server_timestamp: Date.now()
    }
  });
}

function event_Error(data: WebRtcEventMap.IncomingEvents["error"]) {
  appState.dispatch("SET_LAST_ERROR", {
    title: data.type,
    message: data.reason
  });
}

export const events: NetworkEvents<WebRtcMessages.IncomingMessage> = {
  start_file_transit: event_StartFileTransit,
  in_file_transit: event_InFileTransit,
  end_file_transit: event_EndFileTransit,
  pong: event_Pong,
  ping: event_Ping,
  error: event_Error
};
