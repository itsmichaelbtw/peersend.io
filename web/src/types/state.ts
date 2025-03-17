import type { WithNullable } from "./misc";

interface DataPayload<T extends string> {
  type: T;
}

export namespace WebSocketPayload {
  export namespace Types {
    export type Session = "create" | "join" | "host_transfer_granted" | "host_transfer_request";
    export type Signal = "";
    export type Error = "session_full" | "session_not_found" | "invalid_session_code" | "unknown";
  }

  export namespace Data {
    export interface Session extends DataPayload<Types.Session> {}
    export interface Signal extends DataPayload<Types.Signal> {}
    export interface Error extends DataPayload<Types.Error> {
      message: string;
    }
  }
}

export type WebSocketPayloadType =
  | WebSocketPayload.Types.Session
  | WebSocketPayload.Types.Signal
  | WebSocketPayload.Types.Error;

export type WebSocketDataByPayloadType<T extends WebSocketPayloadType> =
  T extends WebSocketPayload.Types.Session
    ? WebSocketPayload.Data.Session
    : T extends WebSocketPayload.Types.Signal
      ? WebSocketPayload.Data.Signal
      : WebSocketPayload.Data.Error;

export type WebSocketMessageType = "session" | "signal" | "error";

export interface IncomingWebSocketMessage<T extends WebSocketPayloadType> {
  type: WebSocketMessageType;
  data: WebSocketDataByPayloadType<T>;
}

export interface WebSocketState {
  ws: WithNullable<WebSocket>;
  session_code: WithNullable<string>;
  is_host: boolean;
  is_connected: boolean;
  client_id: WithNullable<string>;
  last_error_message: WithNullable<string>;
}
