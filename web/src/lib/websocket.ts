import { reactive } from "vue";

type MessageType = "session" | "signal" | "error";

interface Message {
  type: MessageType;
  data: Record<string, any>;
}

interface WebSocketState {
  ws: WebSocket | null;
  session_code: string | null;
  is_host: boolean;
  is_connected: boolean;
  client_id: string | null;
  error_message: string | null;
}

export const state = reactive<WebSocketState>({
  ws: null,
  session_code: null,
  is_host: false,
  is_connected: false,
  client_id: null,
  error_message: null
});

function onMessage(event: MessageEvent): void {
  try {
    const message: Message = JSON.parse(event.data);

    switch (message.type) {
      case "session":
        state.session_code = message.data.code;
        state.client_id = message.data.client_id;
        state.is_host = message.data.is_host;
        state.is_connected = true;
        state.error_message = null;
        break;

      case "signal":
        switch (message.data.type) {
          case "host_transfer_granted": {
            state.is_host = message.data.is_host;
            break;
          }
        }

        break;
      case "error":
        state.error_message = message.data.message;
        break;
    }
  } catch (error) {
    state.error_message = "Failed to parse message";

    if (state.is_connected) {
      disconnectWebsocket();
    }
  }
}

function onError(): void {
  state.error_message = "Unable to establish connection";

  if (state.is_connected) {
    disconnectWebsocket();
  }
}

function onClose(): void {
  state.ws = null;
  state.session_code = null;
  state.is_host = false;
  state.is_connected = false;
  state.client_id = null;
}

export function initialiseWebsocket(code?: string): void {
  if (state.ws) {
    return;
  }

  const url = new URL("ws://localhost:8080/signal");

  if (code) {
    url.searchParams.set("sessionCode", code);
  }

  try {
    state.ws = new WebSocket(url.toString());

    state.ws.onmessage = onMessage;
    state.ws.onerror = onError;
    state.ws.onclose = onClose;
  } catch (error) {
    state.error_message = "Failed to connect";
  }
}

export function disconnectWebsocket(): void {
  if (!state.ws) {
    return;
  }

  state.ws.close();
  state.ws = null;
  state.session_code = null;
  state.is_host = false;
  state.is_connected = false;
  state.client_id = null;
}

export function deliverPayload(type: MessageType, data: Record<string, any>): void {
  if (!state.ws) {
    throw new Error("WebSocket not connected");
  }

  const message: Message = {
    type: type,
    data: data
  };

  state.ws.send(JSON.stringify(message));
}
