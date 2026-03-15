import { appState } from "@/state";
import { createLogger } from "@/utils/logger";

const log = createLogger("LatencyTracker");

export interface PongData {
	client_timestamp: number;
	server_timestamp: number;
}

export class LatencyTracker {
	private interval: number | null = null;
	private readonly intervalMs: number;
	private readonly sendPing: (timestamp: number) => void;

	constructor(sendPing: (timestamp: number) => void, intervalMs: number = 1000) {
		this.sendPing = sendPing;
		this.intervalMs = intervalMs;
	}

	public start(): void {
		this.stop();
		this.sendPing(Date.now());
		this.interval = window.setInterval(() => this.sendPing(Date.now()), this.intervalMs);
		log.info(`Latency tracking started with interval ${this.intervalMs}ms`);
	}

	public stop(): void {
		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
			log.info("Latency tracking stopped");
		}

		appState.dispatch("UPDATE", { sessionState: { latency: -1 } });
	}

	public pong(data: PongData): void {
		const now = Date.now();
		const latency = Math.round(now - data.server_timestamp + (now - data.client_timestamp) / 2);
		appState.dispatch("UPDATE", { sessionState: { latency } });
	}
}
