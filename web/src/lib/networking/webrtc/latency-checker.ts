import type { PongData } from "../core/latency-checker";

import { updateState } from "@/state/app-state";
import { LatencyChecker } from "../core/latency-checker";
import { webrtcClient } from "./client";

export class WebRtcLatencyChecker extends LatencyChecker {
  public ping(): void {
    webrtcClient.emit({
      type: "ping",
      data: {
        client_timestamp: Date.now()
      }
    });
  }

  public pong(data: PongData): void {
    const latency = this.calculate_latency(data);
    this.update_latency(latency);
  }

  public update_latency(latency: number): void {
    updateState({
      sessionState: {
        latency: latency
      }
    });
  }
}
