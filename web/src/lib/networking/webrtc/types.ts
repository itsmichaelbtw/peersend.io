import type { PongData } from "../core/latency-checker";
import type { NetworkMessagePayload } from "../types";

interface WebRtcCommonEvents {
  ping: Pick<PongData, "client_timestamp">;
  pong: PongData;
  file_transit: {
    byteLength: number;
    totalSize: number;
    chunk: number[];
  };
}

export namespace WebRtcEventMap {
  export interface IncomingEvents extends WebRtcCommonEvents {
    error: {
      type: string;
      reason: string;
    };
  }

  export interface OutgoingEvents extends WebRtcCommonEvents {}
}

export namespace WebRtcEvents {
  export type IncomingTypes = keyof WebRtcEventMap.IncomingEvents;
  export type OutgoingTypes = keyof WebRtcEventMap.OutgoingEvents;
}

export namespace WebRtcMessages {
  export type IncomingMessage = {
    [K in keyof WebRtcEventMap.IncomingEvents]: NetworkMessagePayload<
      K,
      WebRtcEventMap.IncomingEvents[K]
    >;
  }[keyof WebRtcEventMap.IncomingEvents];

  export type OutgoingMessage = {
    [K in keyof WebRtcEventMap.OutgoingEvents]: NetworkMessagePayload<
      K,
      WebRtcEventMap.OutgoingEvents[K]
    >;
  }[keyof WebRtcEventMap.OutgoingEvents];
}
