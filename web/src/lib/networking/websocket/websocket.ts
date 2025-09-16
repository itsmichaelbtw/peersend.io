import type { WebSocketMessages } from "./types";
import type { NetworkClients } from "../utils";

import { appState } from "@/state";
import { getNetworkingClients } from "../utils";

export class CustomWebSocket extends WebSocket {
  private networking_clients: NetworkClients;

  constructor(url: string) {
    super(url);

    this.networking_clients = getNetworkingClients();

    this.addEventListener("open", this.on_open.bind(this));
    this.addEventListener("close", this.on_close.bind(this));
    this.addEventListener("error", this.on_error.bind(this));
    this.addEventListener("message", this.on_message.bind(this));
  }

  private on_open() {}

  private on_close(event: CloseEvent) {
    this.networking_clients.ws.disconnect();
    this.networking_clients.ws.stop_latency_monitoring();

    appState.dispatch(
      "SET_LAST_ERROR",
      event.reason
        ? {
            title: "Connection Issue",
            message: event.reason
          }
        : null
    );
  }

  private on_error() {
    appState.dispatch("SET_LAST_ERROR", {
      title: "Connection Issue",
      message: "Failed to connect: The server may be offline"
    });
  }

  private on_message(event: MessageEvent) {
    const { sessionState, websocketState } = appState.get();

    if (sessionState.lastError || websocketState.isConnecting) {
      appState.dispatch("SET_LAST_ERROR", null);
    }

    try {
      const { type, data } = JSON.parse(event.data) as WebSocketMessages.IncomingMessage;
      this.networking_clients.ws.message_bus.emit(type, data);
    } catch (error) {
      appState.dispatch("SET_LAST_ERROR", {
        title: "Message Error happened here",
        message:
          error instanceof Error ? error.message : "Failed to parse incoming WebSocket message"
      });
    }
  }
}
