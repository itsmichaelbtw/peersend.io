import type { PongData } from "./checker";

import { LatencyChecker } from "./checker";

export class WebRTCLatencyChecker extends LatencyChecker {
  private dataChannel: RTCDataChannel;

  constructor(dataChannel: RTCDataChannel) {
    super();
    this.dataChannel = dataChannel;
  }

  /**
   * Send a ping via WebRTC data channel
   */
  public ping(): void {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      return;
    }

    // const pingMessage = {
    //   type: "ping",
    //   data: {
    //     timestamp: Date.now()
    //   }
    // };

    // this.dataChannel.send(JSON.stringify(pingMessage));
  }

  /**
   * Handle pong response from peer
   */
  public pong(data: PongData): void {
    const latency = this.calculateLatency(data);
    this.updateLatency(latency);
  }

  public updateLatency(latency: number): void {
    console.log(`Latency: ${latency} ms`);
  }
}
