export interface PongData {
  client_timestamp: number;
  server_timestamp: number;
}

export abstract class LatencyChecker {
  public abstract ping(): void;
  public abstract pong(data: PongData): void;
  public abstract update_latency(latency: number): void;

  protected calculate_latency(timestamp: PongData): number {
    const now = Date.now();
    const latency = now - timestamp.server_timestamp + (now - timestamp.client_timestamp) / 2;

    return Math.round(latency);
  }
}
