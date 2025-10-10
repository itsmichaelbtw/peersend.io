import type { PongData } from "../core/latency-checker";

import { appState } from "@/state";
import { LatencyChecker } from "../core/latency-checker";
import { webSocketClient } from "./client";

export class WebSocketLatencyChecker extends LatencyChecker {
	public ping(): void {
		webSocketClient.emit({
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
		appState.dispatch("UPDATE", {
			sessionState: {
				latency: latency
			}
		});
	}
}
