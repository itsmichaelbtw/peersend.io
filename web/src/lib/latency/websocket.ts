import type { PongData } from "./checker";

import { LatencyChecker } from "./checker";
import { websocketState } from "@/state/websocket";

export class WebSocketLatencyChecker extends LatencyChecker {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
  }

  /**
   * Send a ping via WebSocket
   */
  public ping(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const pingMessage = {
      type: "ping",
      data: {
        client_timestamp: Date.now()
      }
    };

    this.ws.send(JSON.stringify(pingMessage));
  }

  /**
   * Handle pong response from server
   */
  public pong(data: PongData): void {
    const latency = this.calculateLatency(data);
    this.updateLatency(latency);
  }

  public updateLatency(latency: number): void {
    websocketState.latency = latency;
  }
}
