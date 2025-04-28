import type { PongData } from "./checker";

import { LatencyChecker } from "./checker";
import { WebRTCClient } from "../webrtc";
import { applicationState } from "@/state/application";

export class WebRTCLatencyChecker extends LatencyChecker {
  constructor() {
    super();
  }

  /**
   * Send a ping via WebRTC data channel
   */
  public ping(): void {
    WebRTCClient.emit("ping", {
      client_timestamp: Date.now()
    });
  }

  /**
   * Handle pong response from peer
   */
  public pong(data: PongData): void {
    const latency = this.calculateLatency(data);
    this.updateLatency(latency);
  }

  public updateLatency(latency: number): void {
    applicationState.latency = latency;
  }
}
