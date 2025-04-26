import type { WithNullable } from "@/types/misc";
import type { IncomingTransmissionData } from "@/types/state";

import { router } from "@/router";
import { WEBSOCKET_ENDPOINT } from "@/config/constants";
import {
  DEFAULT_APPLICATION_STATE,
  applicationState,
  flagApplicationError
} from "@/state/application";
import { wsCloseReason } from "@/utils/close-reason";
import { LatencyMonitor } from "./latency/monitor";
import { WebSocketLatencyChecker } from "./latency/websocket";
import { sleep } from "@/utils/sleep";
import { WebRTCClient } from "./webrtc";

export abstract class WebSocketClient extends LatencyMonitor {
  public static getWebSocketState() {
    return applicationState.__protocol.websocket;
  }

  public static emit(type: string, data: Record<string, any>) {
    const websocketState = WebSocketClient.getWebSocketState();

    if (!websocketState.ws || !websocketState.is_connected) {
      return;
    }

    websocketState.ws.send(
      JSON.stringify({
        type: type,
        data: data
      })
    );
  }

  public static onOpen(this: WebSocket, _: Event) {}

  public static onClose(this: WebSocket, event: CloseEvent) {
    const websocketState = WebSocketClient.getWebSocketState();

    websocketState.is_connected = false;
    websocketState.is_connecting = false;

    WebSocketClient.stopLatencyMonitoring();

    const closeReason = wsCloseReason(event.reason);

    if (closeReason.isSessionFull()) {
      return router.push("/session/full");
    }

    WebSocketClient.disconnect();

    if (event.reason) {
      flagApplicationError(event.reason);
    }
  }

  public static onError(this: WebSocket, _: Event) {
    WebSocketClient.disconnect();

    flagApplicationError("Unable to establish connection", "connection_issue");
  }

  public static onMessage(this: WebSocket, event: MessageEvent) {
    const websocketState = WebSocketClient.getWebSocketState();

    if (websocketState.is_connecting) {
      websocketState.is_connecting = false;
    }

    if (applicationState.last_error) {
      applicationState.last_error = null;
    }

    try {
      const payload = JSON.parse(event.data) as IncomingTransmissionData<any>;

      switch (payload.type) {
        case "session_information": {
          websocketState.is_connected = true;
          applicationState.is_connected = true;

          applicationState.client_id = payload.data.client_id;
          applicationState.clients = payload.data.clients;
          applicationState.is_host = payload.data.is_host;
          applicationState.maximum_clients = payload.data.maximum_clients;
          applicationState.session_code = payload.data.session_code;
          applicationState.connection_type = payload.data.connection_type;
          applicationState.auto_webrtc = payload.data.auto_webrtc;
          applicationState.encryption_mode = payload.data.encryption_mode;
          applicationState.connection_type = "websocket";

          WebSocketClient.setupLatencyChecker(new WebSocketLatencyChecker(this));

          break;
        }

        case "pong": {
          if (WebSocketClient.latencyChecker) {
            WebSocketClient.latencyChecker.pong(payload.data);
          }

          break;
        }

        case "sync_online_clients": {
          applicationState.clients = payload.data.clients;
          break;
        }

        case "session_full": {
          applicationState.maximum_clients = payload.data.maximum_clients;
          applicationState.session_code = payload.data.session_code;
          break;
        }

        case "host_transfer": {
          applicationState.is_host = payload.data.is_host;
          break;
        }

        case "webrtc_offer": {
          WebRTCClient.handleOffer(payload.data);
          break;
        }

        case "error": {
          flagApplicationError(payload.data, payload.type);

          websocketState.is_connecting = false;
          applicationState.__protocol.rtc.is_connecting = false;

          break;
        }
      }
    } catch (error) {
      flagApplicationError("Unable to parse latest message", "message_parse_error");
    }
  }

  public static async connect(sessionCode: WithNullable<string>) {
    const websocketState = WebSocketClient.getWebSocketState();

    if (websocketState.is_connecting || websocketState.is_connected) {
      return;
    }

    websocketState.is_connecting = true;

    await sleep(500);

    const url = new URL(WEBSOCKET_ENDPOINT);

    if (sessionCode) {
      url.searchParams.set("sessionCode", sessionCode);
      url.searchParams.set("mode", "join");
    } else {
      url.searchParams.set("mode", "host");
    }

    try {
      websocketState.ws = new WebSocket(url.toString());

      websocketState.ws.onmessage = WebSocketClient.onMessage;
      websocketState.ws.onerror = WebSocketClient.onError;
      websocketState.ws.onclose = WebSocketClient.onClose;
      websocketState.ws.onopen = WebSocketClient.onOpen;
    } catch (error) {
      flagApplicationError("Failed to connect: Server might be offline", "connection_issue");
    }
  }

  public static disconnect() {
    const websocketState = WebSocketClient.getWebSocketState();

    if (websocketState.ws) {
      websocketState.ws = null;
    }

    WebSocketClient.stopLatencyMonitoring();
    WebSocketClient.reset();
  }

  public static reset() {
    console.warn("Resetting WebSocket state");

    Object.assign(applicationState, structuredClone(DEFAULT_APPLICATION_STATE));
  }
}
