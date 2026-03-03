import type { PongData } from "../core/latency-checker";

import { appState } from "@/state";
import { LatencyChecker } from "../core/latency-checker";
import { getWebRTCClient } from "../client-registry";

export class WebRTCLatencyChecker extends LatencyChecker {
	public ping(): void {
		const rtc = getWebRTCClient();
		rtc.emit({
			type: "ping",
			data: {
				client_timestamp: Date.now()
			}
		});
	}

	public pong(data: PongData): void {
		const latency = this.calculateLatency(data);
		this.updateLatency(latency);
	}

	public updateLatency(latency: number): void {
		appState.dispatch("UPDATE", {
			sessionState: {
				latency: latency
			}
		});
	}
}
