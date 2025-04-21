import type { WithNullable } from "./misc";

import type { ConnectionState } from "./connection";

export type IncomingWebSocketMessageType =
  | "session_information"
  | "sync_online_clients"
  | "connection_issue"
  | "message_parse_error"
  | "session_full"
  | "host_transfer"
  | "pong"
  | "error";

export interface WebSocketConnectionState extends ConnectionState {
  ws: WithNullable<WebSocket>;
}
