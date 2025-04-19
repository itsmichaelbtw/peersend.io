import type { WithNullable } from "./misc";

export type EncryptionModes = "none";

export type IncomingWebSocketMessageType =
  | "session_information"
  | "sync_online_clients"
  | "connection_issue"
  | "message_parse_error"
  | "session_full"
  | "error";

export namespace WebSocketData {
  export interface Session {
    session_code: string;
    client_id: string;
    is_host: boolean;
    clients: string[];
    maximum_clients: number;
  }
  export interface Signal {
    is_host: boolean;
  }
  export interface Error {
    message: string;
  }
}

export interface IncomingWebSocketMessage<D extends Record<string, any>> {
  type: IncomingWebSocketMessageType;
  data: D;
}

export interface WebSocketState {
  ws: WithNullable<WebSocket>;
  session_code: WithNullable<string>;
  is_host: boolean;
  is_connected: boolean;
  is_connecting: boolean;
  auto_webrtc: boolean;
  encryption_mode: EncryptionModes;
  latency: number;
  client_id: WithNullable<string>;
  clients: string[];
  maximum_clients: number;
  last_error: WithNullable<IncomingWebSocketMessage<WebSocketData.Error>>;
  connection_type: "direct" | "signal" | "none";
}
