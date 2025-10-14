import type { WebSocketMessages } from "./types";
import type { NetworkClients } from "../utils";

import { appState } from "@/state";
import { getNetworkingClients } from "../utils";
import { abortRegistry } from "../core";
import { createLogger } from "@/utils/logger";

const log = createLogger("CustomWebSocket");

export class CustomWebSocket extends WebSocket {
	private network_clients: NetworkClients;

	constructor(url: string) {
		super(url);

		this.network_clients = getNetworkingClients();

		this.addEventListener("open", this.on_open.bind(this));
		this.addEventListener("close", this.on_close.bind(this));
		this.addEventListener("error", this.on_error.bind(this));
		this.addEventListener("message", this.on_message.bind(this));
	}

	private on_open() {
		log.debug("on_open");
		abortRegistry.start();
	}

	private on_close(event: CloseEvent) {
		log.debug("on_close");

		this.network_clients.ws.disconnect();
		this.network_clients.ws.stop_latency_monitoring();

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

	private on_error() {
		log.error("on_error");

		appState.dispatch("SET_LAST_ERROR", {
			title: "Connection Issue",
			message: "Failed to connect: The server may be offline"
		});
	}

	private on_message(event: MessageEvent) {
		log.debug("on_message");

		const { sessionState, websocketState } = appState.get();

		if (sessionState.lastError || websocketState.isConnecting) {
			appState.dispatch("SET_LAST_ERROR", null);
		}

		try {
			const { type, data } = JSON.parse(event.data) as WebSocketMessages.IncomingMessage;
			log.info("Received a message of type:", type);
			this.network_clients.ws.message_bus.emit(type, data);
		} catch (error) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Message Error happened here",
				message:
					error instanceof Error ? error.message : "Failed to parse incoming WebSocket message"
			});
		}
	}
}
