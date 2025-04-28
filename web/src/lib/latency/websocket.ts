import type { PongData } from "./checker";

import { LatencyChecker } from "./checker";
import { WebSocketClient } from "../websocket";
import { applicationState } from "@/state/application";

export class WebSocketLatencyChecker extends LatencyChecker {
  constructor() {
    super();
  }

  /**
   * Send a ping via WebSocket
   */
  public ping(): void {
    WebSocketClient.emit("ping", {
      client_timestamp: Date.now()
    });
  }

  /**
   * Handle pong response from server
   */
  public pong(data: PongData): void {
    const latency = this.calculateLatency(data);
    this.updateLatency(latency);
  }

  public updateLatency(latency: number): void {
    applicationState.latency = latency;
  }
}
