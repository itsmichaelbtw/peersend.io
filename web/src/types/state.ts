import type { WithNullable } from "./misc";
import type { IncomingWebSocketMessageType } from "./websocket";
import type { IncomingWebRTCMessageType } from "./webrtc";

export interface ConnectionErrorData {
  message: string;
}

export type EncryptionModes = "none";
export interface IncomingTransmissionData<D extends Record<string, any>> {
  type: IncomingWebSocketMessageType | IncomingWebRTCMessageType;
  data: D;
}

export interface ApplicationState {
  session_code: WithNullable<string>;
  is_host: boolean;
  is_connected: boolean;
  auto_webrtc: boolean;
  encryption_mode: EncryptionModes;
  latency: number;
  client_id: WithNullable<string>;
  clients: string[];
  maximum_clients: number;
  last_error: WithNullable<IncomingTransmissionData<ConnectionErrorData>>;
  connection_type: "websocket" | "webrtc" | "none";
}
