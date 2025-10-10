import type { NetworkClients } from "../utils";
import type { WebRtcMessages } from "./types";

import { appState } from "@/state";
import { getNetworkingClients } from "../utils";
import { abortRegistry } from "../core";

export class CustomDataChannel {
	private network_clients: NetworkClients;
	private channel: RTCDataChannel;

	constructor(channel: RTCDataChannel) {
		this.network_clients = getNetworkingClients();
		this.channel = channel;
		this.channel.addEventListener("open", this.on_open.bind(this));
		this.channel.addEventListener("close", this.on_close.bind(this));
		this.channel.addEventListener("error", this.on_error.bind(this));
		this.channel.addEventListener("message", this.on_message.bind(this));
	}

	private on_open(event: Event) {
		const { sessionState } = appState.get();

		if (sessionState.isHost) {
			return;
		}

		this.network_clients.wrtc.start_latency_monitoring();
	}

	private on_close(event: Event) {
		abortRegistry.end();
	}

	private on_error(event: RTCErrorEvent) {
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

	private async on_message(event: MessageEvent) {
		const { sessionState, webrtcState } = appState.get();

		if (sessionState.lastError || webrtcState.isConnecting) {
			appState.dispatch("SET_LAST_ERROR", null);
		}

		switch (true) {
			case event.data instanceof Blob:
				const buffer = await event.data.arrayBuffer();
				this.network_clients.wrtc.message_bus.emit("in_file_transit", buffer);
				return;

			case event.data instanceof ArrayBuffer:
				const chunk = new Uint8Array(event.data);
				this.network_clients.wrtc.message_bus.emit("in_file_transit", chunk);
				return;

			case event.data instanceof Uint8Array:
				this.network_clients.wrtc.message_bus.emit("in_file_transit", event.data);
				return;
		}

		try {
			const { type, data } = JSON.parse(event.data) as WebRtcMessages.IncomingMessage;
			this.network_clients.wrtc.message_bus.emit(type, data);
		} catch (error) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Failed to parse incoming WebRTC message",
				message: error instanceof Error ? error.message : "Failed to parse incoming WebRTC message"
			});
		}
	}

	public getDataChannel() {
		return this.channel;
	}

	public get readyState() {
		return this.channel.readyState;
	}

	public send(data: any) {
		try {
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

	public close() {
		this.channel.close();
	}
}
