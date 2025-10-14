import { LatencyChecker } from "./latency-checker";
import { createLogger } from "@/utils/logger";

const log = createLogger("LatencyMonitor");

export abstract class LatencyMonitor {
	protected ping_interval: number | null = null;
	protected ping_interval_ms: number = 1000;

	public latency_checker: LatencyChecker;

	constructor(latency_checker: LatencyChecker) {
		this.latency_checker = latency_checker;
	}

	public start_latency_monitoring(): void {
		this.stop_latency_monitoring();

		if (!this.latency_checker) {
			log.error(
				"When using LatencyMonitor, you must set a LatencyChecker. Please call set() before starting latency monitoring."
			);
			return;
		}

		this.ping_interval = window.setInterval(() => {
			if (this.latency_checker) {
				this.latency_checker.ping();
			}
		}, this.ping_interval_ms);

		this.latency_checker.ping();

		log.info(`Latency monitoring started with interval ${this.ping_interval_ms}ms`);
	}

	public stop_latency_monitoring(): void {
		if (this.ping_interval !== null) {
			log.info("Latency monitoring stopped");
			clearInterval(this.ping_interval);
			this.ping_interval = null;
		}

		this.latency_checker?.update_latency(-1);
	}

	public set_ping_interval(ms: number): void {
		this.ping_interval_ms = ms;

		if (this.ping_interval !== null && this.latency_checker) {
			this.start_latency_monitoring();
		}
	}
}
