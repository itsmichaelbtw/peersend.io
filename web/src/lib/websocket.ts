import type { WithNullable } from "@/types/misc";

import { WEBSOCKET_ENDPOINT } from "@/config/constants";
import { websocketState as state } from "@/state/websocket";

export abstract class WebSocketSingleton {
  public static onOpen(this: WebSocket, _: Event) {}

  public static onClose(this: WebSocket, _: CloseEvent) {
    WebSocketSingleton.disconnect();
  }

  public static onError(this: WebSocket, event: Event) {
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
      // const payload = JSON.parse(event.data) as IncomingWebSocketMessage<any>;
      // switch (payload.type) {
      //   case "session_information": {
      //     websocketState.is_connected = true;
      //     keyMatchStateUpdate(state, payload.data, [
      //       "session_code",
      //       "client_id",
      //       "is_host",
      //       "maximum_clients"
      //     ]);
      //     break;
      //   }
      //   case "sync_online_clients": {
      //     keyMatchStateUpdate(state, payload.data, ["clients"]);
      //     break;
      //   }
      // }
      // switch (payload.type) {
      //   case "session": {
      //     const data = payload.data as WebSocketPayload.Data.Session;
      //     state.session_code = data.session_code;
      //     state.client_id = data.client_id;
      //     state.is_host = data.is_host;
      //     state.is_connected = true;
      //     state.last_error = null;
      //     break;
      //   }
      //   case "signal": {
      //     const data = payload.data as WebSocketPayload.Data.Signal;
      //     switch (data.type) {
      //       case "host_transfer_granted": {
      //         state.is_host = data.is_host;
      //         break;
      //       }
      //     }
      //     break;
      //   }
      //   case "error": {
      //     const data = payload.data as WebSocketPayload.Data.Error;
      //     state.last_error = {
      //       type: data.type,
      //       message: data.message
      //     };
      //     break;
      //   }
      // }
    } catch (error) {
      state.last_error = {
        type: "message_parse_error",
        data: {
          message: "Unable to parse latest message"
        }
      };
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
    if (!state.ws) {
      return;
    }

    state.ws.close();

    WebSocketSingleton.reset();
  }

  public static reset() {
    state.ws = null;
    state.session_code = null;
    state.is_host = false;
    state.is_connected = false;
    state.is_connecting = false;
    state.client_id = null;
    state.last_error = null;
  }
}
