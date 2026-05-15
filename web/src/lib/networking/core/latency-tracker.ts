import { appState } from "@/state";
import { createLogger } from "@/utils/logger";

const log = createLogger("LatencyTracker");

const MAX_HISTORY = 25;

export interface PongData {
	client_timestamp: number;
	server_timestamp: number;
}

export class LatencyTracker {
	private interval: number | null = null;
	private readonly intervalMs: number;
	private readonly sendPing: (timestamp: number) => void;
	private history: number[] = [];

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

		this.history = [];
		appState.dispatch("UPDATE", { sessionState: { latencyHistory: [] } });
	}

	public pong(data: PongData): void {
		const now = Date.now();
		const latency = Math.round(now - data.server_timestamp + (now - data.client_timestamp) / 2);

		this.history = [...this.history, latency].slice(-MAX_HISTORY);
		appState.dispatch("UPDATE", { sessionState: { latencyHistory: this.history } });
	}
}
