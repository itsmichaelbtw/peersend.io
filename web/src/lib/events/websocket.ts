import type { IncomingTransmissionData } from "@/types/state";

import { WebSocketClient } from "../websocket";
import { WebRTCClient } from "../webrtc";
import { WebSocketLatencyChecker } from "../latency/websocket";

import { router } from "@/router";
import { socketState, rtcState, applicationState, flagApplicationError } from "@/state/application";
import { wsCloseReason } from "@/utils/close-reason";

export abstract class WebSocketEvents {
  public static onOpen(this: WebSocket, _: Event) {}

  public static onClose(this: WebSocket, event: CloseEvent) {
    socketState.is_connected = false;
    socketState.is_connecting = false;

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
    flagApplicationError("Failed to connect: Server might be offline", "connection_issue");
  }

  public static onMessage(this: WebSocket, event: MessageEvent) {
    if (socketState.is_connecting) {
      socketState.is_connecting = false;
    }

    if (applicationState.last_error) {
      applicationState.last_error = null;
    }

    try {
      const payload = JSON.parse(event.data) as IncomingTransmissionData<any>;

      switch (payload.type) {
        case "session_information":
          socketState.is_connected = true;
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

          WebSocketClient.setupLatencyChecker(new WebSocketLatencyChecker());
          break;

        case "pong":
          if (WebSocketClient.latencyChecker) {
            WebSocketClient.latencyChecker.pong(payload.data);
          }
          break;

        case "sync_online_clients":
          if (applicationState.clients.length > payload.data.clients.length) {
            WebRTCClient.disconnect();
          }

          applicationState.clients = payload.data.clients;

          break;

        case "session_full":
          applicationState.maximum_clients = payload.data.maximum_clients;
          applicationState.session_code = payload.data.session_code;
          break;

        case "host_transfer":
          applicationState.is_host = payload.data.is_host;
          break;

        case "webrtc_offer":
          WebRTCClient.handleOffer(payload.data.description);
          break;

        case "webrtc_reject":
          WebRTCClient.declineOffer(payload.data.reason);
          break;

        case "webrtc_accept":
          WebRTCClient.acceptOffer(payload.data.description);
          break;

        case "webrtc_ice_candidate":
          WebRTCClient.handleICECandidate(payload.data.candidate);
          break;

        case "error":
          flagApplicationError(payload.data.message, payload.type);

          socketState.is_connecting = false;
          rtcState.is_connecting = false;

          break;
      }
    } catch (error) {
      flagApplicationError("Unable to parse latest message", "message_parse_error");
    }
  }
}
