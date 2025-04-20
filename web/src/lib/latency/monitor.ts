import { LatencyChecker } from "./checker";

export abstract class LatencyMonitor {
  public static latencyChecker: LatencyChecker | null = null;
  public static pingInterval: number | null = null;
  public static pingIntervalMs: number = 1000;

  public static startLatencyMonitoring(): void {
    this.stopLatencyMonitoring();

    if (!this.latencyChecker) {
      console.error(
        "When using LatencyMonitor, you must set a LatencyChecker. Please call setupLatencyChecker() before starting latency monitoring."
      );
      return;
    }

    this.pingInterval = window.setInterval(() => {
      if (this.latencyChecker) {
        this.latencyChecker.ping();
      }
    }, this.pingIntervalMs);

    this.latencyChecker.ping();

    console.info(`Latency monitoring started with interval ${this.pingIntervalMs}ms`);
  }

  public static stopLatencyMonitoring(): void {
    if (this.pingInterval !== null) {
      console.info("Latency monitoring stopped");
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.latencyChecker?.updateLatency(-1);
  }

  public static setPingInterval(ms: number): void {
    this.pingIntervalMs = ms;

    if (this.pingInterval !== null && this.latencyChecker) {
      this.startLatencyMonitoring();
    }
  }

  public static setupLatencyChecker(latencyChecker: LatencyChecker): void {
    this.latencyChecker = latencyChecker;
    this.startLatencyMonitoring();
  }
}
