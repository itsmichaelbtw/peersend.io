import type { WithNullable } from "@/types/misc";
import type { IncomingTransmissionData } from "@/types/state";

import { WEBSOCKET_ENDPOINT } from "@/config/constants";
import {
  DEFAULT_APPLICATION_STATE,
  DEFAULT_WEBRTC_STATE,
  DEFAULT_WEBSOCKET_STATE,
  applicationState,
  socketState,
  rtcState,
  flagApplicationError
} from "@/state/application";
import { LatencyMonitor } from "./latency/monitor";
import { sleep } from "@/utils/sleep";
import { WebSocketEvents } from "./events/websocket";

export abstract class WebSocketClient extends LatencyMonitor {
  public static emit(
    type: IncomingTransmissionData<any>["type"] & (string & {}),
    data: Record<string, any>
  ) {
    if (!socketState.ws || !socketState.is_connected) {
      return;
    }

    socketState.ws.send(
      JSON.stringify({
        type: type,
        data: data
      })
    );
  }

  public static async connect(sessionCode: WithNullable<string>) {
    if (socketState.is_connecting || socketState.is_connected) {
      return;
    }

    socketState.is_connecting = true;

    await sleep(500);

    const url = new URL(WEBSOCKET_ENDPOINT);

    if (sessionCode) {
      url.searchParams.set("sessionCode", sessionCode);
      url.searchParams.set("mode", "join");
    } else {
      url.searchParams.set("mode", "host");
    }

    try {
      socketState.ws = new WebSocket(url.toString());

      socketState.ws.onmessage = WebSocketEvents.onMessage;
      socketState.ws.onerror = WebSocketEvents.onError;
      socketState.ws.onclose = WebSocketEvents.onClose;
      socketState.ws.onopen = WebSocketEvents.onOpen;
    } catch (error) {
      socketState.is_connecting = false;
      flagApplicationError("Unable to establish connection", "connection_issue");
    }
  }

  public static disconnect() {
    if (socketState.ws) {
      socketState.ws = null;
    }

    WebSocketClient.stopLatencyMonitoring();
    WebSocketClient.reset();
  }

  public static reset() {
    console.warn("Resetting WebSocket state");

    Object.assign(rtcState, structuredClone(DEFAULT_WEBRTC_STATE));
    Object.assign(socketState, structuredClone(DEFAULT_WEBSOCKET_STATE));
    Object.assign(applicationState, structuredClone(DEFAULT_APPLICATION_STATE));
  }
}
