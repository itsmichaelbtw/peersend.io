import type { WebSocketMessages } from "./types";
import type { WithNullable } from "@/types/misc";

import { NetworkClient } from "../network-client";
import { CustomWebSocket } from "./websocket";
import { WebSocketLatencyChecker } from "./latency-checker";
import { events } from "./events";

import {
	DEFAULT_SESSION_STATE,
	DEFAULT_WEBRTC_STATE,
	DEFAULT_WEBSOCKET_STATE,
	WEBSOCKET_ENDPOINT
} from "@/config/constants";
import { appState, isWebSocketConnected } from "@/state";
import { sleep } from "@/utils/sleep";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebSocketClient");

export class WebSocketClient extends NetworkClient<
	WebSocketMessages.IncomingMessage,
	WebSocketMessages.OutgoingMessage
> {
	private url: string;

	constructor(url: string) {
		super(new WebSocketLatencyChecker());
		this.url = url;

		this.register_events(events);
	}

	public async connect(sessionCode: WithNullable<string>): Promise<void> {
		const { websocketState } = appState.get();

		if (isWebSocketConnected() || websocketState.isConnecting) {
			log.warn("WebSocket is already connected ~ cannot connect again");
			return;
		}

		log.info("Attempting to establish a WebSocket connection");

		appState.dispatch("UPDATE", { websocketState: { isConnecting: true } });
		await sleep(500);

		try {
			const url = new URL(this.url);

			if (sessionCode) {
				url.searchParams.set("session_code", sessionCode);
				url.searchParams.set("mode", "join");
			} else {
				url.searchParams.set("mode", "host");
			}

			appState.dispatch("UPDATE", { websocketState: { ws: new CustomWebSocket(url.toString()) } });
		} catch (error) {
			log.error("Failed to establish a WebSocket connection");

			this.disconnect();
			appState.dispatch("SET_LAST_ERROR", {
				title: "Connection Issue",
				message: error instanceof Error ? error.message : "Unable to establish connection"
			});
		}
	}

	public async disconnect(): Promise<void> {
		const { websocketState } = appState.get();

		if (websocketState.ws) {
			const readyState = websocketState.ws.readyState;

			if (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING) {
				websocketState.ws.close();
			}
		}

		this.stop_latency_monitoring();
		this.reset();

		log.info("Disconnected");
	}

	public reset(): void {
		appState.dispatch("UPDATE", {
			sessionState: DEFAULT_SESSION_STATE,
			webrtcState: DEFAULT_WEBRTC_STATE,
			websocketState: DEFAULT_WEBSOCKET_STATE
		});

		log.debug("State has been reset");
	}

	public emit(event: WebSocketMessages.OutgoingMessage): void {
		const { websocketState } = appState.get();

		if (!isWebSocketConnected()) {
			log.warn("WebSocket is not connected. Cannot send message.");
			return;
		}

		log.info(`Emitting event: ${event.type}`);

		const payload = JSON.stringify(event);
		websocketState.ws!.send(payload);
	}
}

export const webSocketClient = new WebSocketClient(WEBSOCKET_ENDPOINT);
