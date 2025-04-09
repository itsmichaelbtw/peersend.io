import type { WithNullable } from "./misc";

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
  type: string;
  data: D;
}

export interface WebSocketState {
  ws: WithNullable<WebSocket>;
  session_code: WithNullable<string>;
  is_host: boolean;
  is_connected: boolean;
  is_connecting: boolean;
  client_id: WithNullable<string>;
  clients: string[];
  maximum_clients: number;
  last_error: WithNullable<IncomingWebSocketMessage<WebSocketData.Error>>;
}
