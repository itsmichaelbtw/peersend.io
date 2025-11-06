import type { WebSocketIncomingMessage } from "./types";

import { appState } from "@/state";
import { createLogger } from "@/utils/logger";
import { getWebSocketClient } from "../utils";
import { abortRegistry } from "../core";

const log = createLogger("CustomWebSocket");

export class CustomWebSocket extends WebSocket {
	constructor(url: string) {
		super(url);

		this.addEventListener("open", this.onOpen.bind(this));
		this.addEventListener("close", this.onClose.bind(this));
		this.addEventListener("error", this.onError.bind(this));
		this.addEventListener("message", this.onMessage.bind(this));
	}

	private onOpen() {
		log.debug("onOpen event received");
		abortRegistry.start();
	}

	private onClose(event: CloseEvent) {
		log.debug("onClose event received");

		getWebSocketClient().disconnect();

		appState.dispatch(
			"SET_LAST_ERROR",
			event.reason
				? {
						title: "Connection Issue",
						message: event.reason
					}
				: null
		);

		abortRegistry.end();
	}

	private onError() {
		log.error("onError event received");

		appState.dispatch("SET_LAST_ERROR", {
			title: "Connection Issue",
			message: "Failed to connect: The server may be offline"
		});
	}

	private onMessage(event: MessageEvent) {
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
			getWebSocketClient().messageBus.emit(type, data);
		} catch (error) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Message Error happened here",
				message:
					error instanceof Error ? error.message : "Failed to parse incoming WebSocket message"
			});
		}
	}
}
