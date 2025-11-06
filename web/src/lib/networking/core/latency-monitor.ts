import { LatencyChecker } from "./latency-checker";
import { createLogger } from "@/utils/logger";

const log = createLogger("LatencyMonitor");

export abstract class LatencyMonitor {
	protected pingInterval: number | null = null;
	protected pingIntervalMS: number = 1000;

	public latencyChecker: LatencyChecker;

	constructor(latencyChecker: LatencyChecker) {
		this.latencyChecker = latencyChecker;
	}

	public startLatencyMonitoring(): void {
		this.stopLatencyMonitoring();

		if (!this.latencyChecker) {
			log.error(
				"When using LatencyMonitor, you must set a LatencyChecker. Please call set() before starting latency monitoring."
			);
			return;
		}

		this.pingInterval = window.setInterval(() => {
			if (this.latencyChecker) {
				this.latencyChecker.ping();
			}
		}, this.pingIntervalMS);

		this.latencyChecker.ping();

		log.info(`Latency monitoring started with interval ${this.pingIntervalMS}ms`);
	}

	public stopLatencyMonitoring(): void {
		if (this.pingInterval !== null) {
			log.info("Latency monitoring stopped");
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}

		this.latencyChecker?.updateLatency(-1);
	}

	public setPingInterval(ms: number): void {
		this.pingIntervalMS = ms;

		if (this.pingInterval !== null && this.latencyChecker) {
			this.startLatencyMonitoring();
		}
	}
}
