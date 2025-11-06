import type { WebSocketIncomingMessage, WebSocketOutgoingMessage } from "./types";

import { NetworkClient } from "../network-client";
import { CustomWebSocket } from "./websocket";
import { WebSocketLatencyChecker } from "./latency-checker";
import { events } from "./events";

import {
	DEFAULT_SESSION_STATE,
	DEFAULT_WEBRTC_STATE,
	DEFAULT_WEBSOCKET_STATE
} from "@/config/constants";
import { appState, isWebSocketConnected } from "@/state";
import { sleep } from "@/utils/sleep";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebSocketClient");

export class WebSocketClient extends NetworkClient<
	WebSocketIncomingMessage,
	WebSocketOutgoingMessage
> {
	private url: string;

	constructor(url: string) {
		super(new WebSocketLatencyChecker());
		this.url = url;

		this.registerEvents(events);
	}

	public override async connect(sessionCode?: string): Promise<this> {
		const { websocketState } = appState.get();

		if (isWebSocketConnected() || websocketState.isConnecting) {
			log.warn("WebSocket is already connected ~ cannot connect again");
			return this;
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

		return this;
	}

	public disconnect(): this {
		const { websocketState } = appState.get();

		if (websocketState.ws) {
			const readyState = websocketState.ws.readyState;

			if (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING) {
				websocketState.ws.close();
			}
		}

		this.stopLatencyMonitoring();
		this.reset();

		log.info("Disconnected");

		return this;
	}

	public reset(): this {
		appState.dispatch("UPDATE", {
			sessionState: DEFAULT_SESSION_STATE,
			webrtcState: DEFAULT_WEBRTC_STATE,
			websocketState: DEFAULT_WEBSOCKET_STATE
		});

		log.debug("State has been reset");

		return this;
	}

	public emit(event: WebSocketOutgoingMessage): this {
		const { websocketState } = appState.get();

		if (!isWebSocketConnected()) {
			log.warn("WebSocket is not connected. Cannot send message.");
			return this;
		}

		log.debug(`Emitting event: ${event.type}`);

		const payload = JSON.stringify(event);
		websocketState.ws!.send(payload);

		return this;
	}
}
