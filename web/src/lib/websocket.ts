import type { WithNullable } from "@/types/misc";
import type { IncomingWebSocketMessage } from "@/types/state";

import { router } from "@/router";
import { WEBSOCKET_ENDPOINT } from "@/config/constants";
import { websocketState as state } from "@/state/websocket";
import { keyMatchStateUpdate } from "@/utils/update-state";
import { wsCloseReason } from "@/utils/close-reason";

export abstract class WebSocketSingleton {
  public static getState() {
    return state;
  }

  public static onOpen(this: WebSocket, _: Event) {}

  public static onClose(this: WebSocket, event: CloseEvent) {
    state.is_connecting = false;

    const closeReason = wsCloseReason(event.reason);

    if (closeReason.isSessionFull()) {
      return router.push("/session/full");
    }

    WebSocketSingleton.disconnect();

    state.last_error = {
      type: "error",
      data: {
        message: event.reason
      }
    };
  }

  public static onError(this: WebSocket, _: Event) {
    WebSocketSingleton.disconnect();

    state.last_error = {
      type: "connection_issue",
      data: {
        message: "Unable to establish connection"
      }
    };
  }

  public static onMessage(this: WebSocket, event: MessageEvent) {
    if (state.is_connecting) {
      state.is_connecting = false;
    }

    if (state.last_error) {
      state.last_error = null;
    }

    try {
      const payload = JSON.parse(event.data) as IncomingWebSocketMessage<any>;

      switch (payload.type) {
        case "session_information": {
          state.is_connected = true;

          keyMatchStateUpdate(state, payload.data, [
            "client_id",
            "clients",
            "is_host",
            "maximum_clients",
            "session_code"
          ]);

          break;
        }

        case "sync_online_clients": {
          keyMatchStateUpdate(state, payload.data, ["clients"]);
          break;
        }

        case "session_full": {
          keyMatchStateUpdate(state, payload.data, ["maximum_clients", "session_code"]);
          break;
        }

        case "error": {
          state.last_error = {
            type: payload.type,
            data: payload.data
          };
          break;
        }
      }
    } catch (error) {
      state.last_error = {
        type: "message_parse_error",
        data: {
          message: "Unable to parse latest message"
        }
      };
    } finally {
      state.is_connecting = false;
    }
  }

  public static connect(sessionCode: WithNullable<string>) {
    if (state.ws || state.is_connected) {
      return;
    }

    state.is_connecting = true;

    const url = new URL(WEBSOCKET_ENDPOINT);

    if (sessionCode) {
      url.searchParams.set("sessionCode", sessionCode);
      url.searchParams.set("mode", "join");
    } else {
      url.searchParams.set("mode", "host");
    }

    try {
      state.ws = new WebSocket(url.toString());

      state.ws.onmessage = WebSocketSingleton.onMessage;
      state.ws.onerror = WebSocketSingleton.onError;
      state.ws.onclose = WebSocketSingleton.onClose;
      state.ws.onopen = WebSocketSingleton.onOpen;
    } catch (error) {
      state.last_error = {
        type: "connection_issue",
        data: {
          message: "Unable to establish connection"
        }
      };
    }
  }

  public static disconnect() {
    if (state.ws) {
      state.ws.close();
    }

    WebSocketSingleton.reset();
  }

  public static reset() {
    console.warn("Resetting WebSocket state");

    state.ws = null;
    state.session_code = null;
    state.is_host = false;
    state.is_connected = false;
    state.is_connecting = false;
    state.client_id = null;
    state.last_error = null;
  }
}
