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
}

const state = reactive<WebSocketState>({
  ws: null,
  session_code: null,
  is_host: false,
  is_connected: false,
  client_id: null
});

function handleMessage(event: MessageEvent): void {
  const message: Message = JSON.parse(event.data);

  switch (message.type) {
    case "session":
      state.session_code = message.data.code;
      state.client_id = message.data.client_id;
      state.is_host = message.data.is_host;
      break;

    case "signal":
      if (message.data.type === "host_transfer") {
        state.is_host = true;
      }
      break;

    case "error":
      console.error("WebSocket error:", message.data.error);
      break;
  }
}

export function initialiseWebsocket(code?: string): void {
  if (state.ws) {
    return;
  }

  const url = new URL("ws://localhost:8080/signal");

  if (code) {
    url.searchParams.set("sessionCode", code);
  }

  state.ws = new WebSocket(url.toString());

  state.ws.onmessage = handleMessage;
  state.ws.onerror = function (): void {
    console.error("WebSocket error occurred");
  };
  state.ws.onopen = function (): void {
    state.is_connected = true;
  };
  state.ws.onclose = function (): void {
    state.ws = null;
    state.session_code = null;
    state.is_host = false;
    state.is_connected = false;
    state.client_id = null;
  };
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

export function sendSignal(data: Record<string, any>): void {
  if (!state.ws) {
    throw new Error("WebSocket not connected");
  }

  const message: Message = {
    type: "signal",
    data
  };

  state.ws.send(JSON.stringify(message));
}

export { state };
