import type { WebSocketIncomingMessage, WebSocketOutgoingMessage } from "./types";
import type { WebSocketHandlerContext } from "./handlers";
import type { WebRTCClient } from "../webrtc/client";

import { NetworkClient } from "../core/network-client";
import { LatencyTracker } from "../core/latency-tracker";
import { WebSocketAdapter } from "../adapters/websocket-adapter";
import { messageHandlers } from "./handlers";
import { abortRegistry } from "../core/abort-registry";

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
	WebSocketOutgoingMessage,
	WebSocketHandlerContext
> {
	private readonly url: string;

	constructor(url: string, rtc: WebRTCClient) {
		super(
			new LatencyTracker((timestamp) => {
				this.emit({ type: "ping", data: { client_timestamp: timestamp } });
			})
		);
		this.url = url;

		this.messageBus.setContext({ ws: this, rtc });
		this.registerEvents(messageHandlers);
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

			const ws = new WebSocketAdapter(url.toString(), {
				onOpen: (): void => {
					log.debug("onOpen event received");
					abortRegistry.start();
				},
				onClose: (event): void => {
					log.debug("onClose event received");
					this.disconnect();
					appState.dispatch(
						"SET_LAST_ERROR",
						event.reason ? { title: "Connection Issue", message: event.reason } : null
					);
					abortRegistry.end();
				},
				onError: (): void => {
					log.error("onError event received");
					appState.dispatch("SET_LAST_ERROR", {
						title: "Connection Issue",
						message: "Failed to connect: The server may be offline"
					});
				},
				onMessage: (event): void => {
					this.handleRawMessage(event);
				}
			});

			appState.dispatch("UPDATE", { websocketState: { ws } });
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

	private handleRawMessage(event: MessageEvent): void {
		log.debug("onMessage event received");

		const { sessionState, websocketState } = appState.get();

		if (sessionState.lastError || websocketState.isConnecting) {
			appState.dispatch("SET_LAST_ERROR", null);
		}

		try {
			if (typeof event.data !== "string") {
				throw new Error("Invalid message format: expected string");
			}

			const { type, data } = JSON.parse(event.data) as WebSocketIncomingMessage;

			log.debug("Received a message of type:", type);
			this.messageBus.emit(type, data);
		} catch (error) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Message Error",
				message:
					error instanceof Error ? error.message : "Failed to parse incoming WebSocket message"
			});
		}
	}
}
