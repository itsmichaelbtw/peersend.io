import type { WebRTCIncomingMessage } from "./types";

import { appState } from "@/state";
import { getWebRTCClient } from "../utils";
import { abortRegistry } from "../core";
import { createLogger } from "@/utils/logger";

const log = createLogger("CustomDataChannel");

export class CustomDataChannel {
	private channel: RTCDataChannel;

	constructor(channel: RTCDataChannel) {
		this.channel = channel;
		this.channel.addEventListener("open", this.onOpen.bind(this));
		this.channel.addEventListener("close", this.onClose.bind(this));
		this.channel.addEventListener("error", this.onError.bind(this));
		this.channel.addEventListener("message", (event) => {
			void this.onMessage(event);
		});
	}

	private onOpen(): void {
		log.debug("onOpen");

		const { sessionState } = appState.get();

		if (sessionState.isHost) {
			return;
		}

		getWebRTCClient().startLatencyMonitoring();
	}

	private onClose(): void {
		log.debug("onClose");
		abortRegistry.end();
	}

	private onError(event: RTCErrorEvent): void {
		log.error("onError", event.error);

		if (event.error) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Direct Connection Error",
				message:
					event.error instanceof Error
						? event.error.message
						: "An error occurred with the direct connection"
			});
		}
	}

	private async onMessage(event: MessageEvent): Promise<void> {
		const { sessionState, webrtcState } = appState.get();

		if (sessionState.lastError || webrtcState.isConnecting) {
			appState.dispatch("SET_LAST_ERROR", null);
		}

		switch (true) {
			case event.data instanceof Blob: {
				const buffer = await event.data.arrayBuffer();
				log.debug("Received a file chunk as instanceof Blob");
				getWebRTCClient().messageBus.emit("in_file_transit", buffer);
				return;
			}

			case event.data instanceof ArrayBuffer: {
				const chunk = new Uint8Array(event.data);
				log.debug("Received a file chunk as instanceof ArrayBuffer");
				getWebRTCClient().messageBus.emit("in_file_transit", chunk);
				return;
			}

			case event.data instanceof Uint8Array: {
				log.debug("Received a file chunk as instanceof Uint8Array");
				getWebRTCClient().messageBus.emit("in_file_transit", event.data);
				return;
			}
		}

		try {
			if (typeof event.data !== "string") {
				throw new Error("Invalid message format: expected string");
			}

			const { type, data } = JSON.parse(event.data) as WebRTCIncomingMessage;
			log.debug("Received a message of type:", type);
			getWebRTCClient().messageBus.emit(type, data);
		} catch (error) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Failed to parse incoming WebRTC message",
				message: error instanceof Error ? error.message : "Failed to parse incoming WebRTC message"
			});
		}
	}

	public getDataChannel(): RTCDataChannel {
		return this.channel;
	}

	public get readyState(): RTCDataChannelState {
		return this.channel.readyState;
	}

	public send(data: unknown): void {
		try {
			log.debug("Sending data to peer via data channel");

			// @ts-expect-error Controlled data type
			this.channel.send(data);
		} catch (error) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Message Transfer Failed",
				message:
					error instanceof Error
						? error.message
						: "Something happened when sending a message to the other client"
			});
		}
	}

	public close(): void {
		this.channel.close();
	}
}
