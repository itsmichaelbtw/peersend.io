import type { WebRTCIncomingMessage, WebRTCOutgoingMessage } from "./types";
import type { DataChannelAdapterEvents } from "../adapters/data-channel-adapter";
import type { WebRTCHandlerContext } from "./handlers";

import { NetworkClient } from "../core/network-client";
import { LatencyTracker } from "../core/latency-tracker";
import { PeerConnectionAdapter } from "../adapters/peer-connection-adapter";
import { DataChannelAdapter } from "../adapters/data-channel-adapter";
import { messageHandlers } from "./handlers";
import { getWebSocketClient } from "../client-registry";
import { abortRegistry } from "../core/abort-registry";

import { appState, isWebRtcConnected, isWebSocketConnected, fileTransferState } from "@/state";
import { DEFAULT_WEBRTC_STATE } from "@/config/constants";
import { sleep } from "@/utils/sleep";
import { createLogger } from "@/utils/logger";
import { toast } from "sonner";

const log = createLogger("WebRTCClient");

const RTC_CONFIGURATION: RTCConfiguration = {
	iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
};

export class WebRTCClient extends NetworkClient<
	WebRTCIncomingMessage,
	WebRTCOutgoingMessage,
	WebRTCHandlerContext
> {
	private pc: PeerConnectionAdapter | null = null;

	constructor() {
		super(
			new LatencyTracker((timestamp) => {
				this.emit({ type: "ping", data: { client_timestamp: timestamp } });
			})
		);

		this.messageBus.setContext({ rtc: this });
		this.registerEvents(messageHandlers);
	}

	private createPeerConnection(): PeerConnectionAdapter {
		return new PeerConnectionAdapter(RTC_CONFIGURATION, {
			onIceCandidate: (event): void => {
				if (event.candidate) {
					const ws = getWebSocketClient();
					ws.emit({
						type: "webrtc_ice_candidate",
						data: { candidate: event.candidate.toJSON() }
					});
				}
			},
			onIceCandidateError: (): void => {
				log.error("onICECandidateError");
			},
			onIceConnectionStateChange: (): void => {
				log.debug("onIceConnectionStateChange");
			},
			onConnectionStateChange: (): void => {
				if (!this.pc) return;

				const state = this.pc.connectionState;
				log.debug(`Connection state changed to: ${state}`);

				switch (state) {
					case "connected": {
						appState.dispatch("UPDATE", {
							sessionState: { connectionType: "webrtc" },
							webrtcState: { isConnected: true, isConnecting: false }
						});

						const ws = getWebSocketClient();
						ws.stopLatencyMonitoring();
						this.startLatencyMonitoring();
						break;
					}
					case "failed":
					case "closed": {
						this.disconnect();
					}
				}
			},
			onDataChannel: (event): void => {
				log.info("Data channel established by remote peer");
				const dc = new DataChannelAdapter(event.channel, this.createDataChannelEvents());
				appState.dispatch("UPDATE", { webrtcState: { dataChannel: dc } });
			}
		});
	}

	private createDataChannelEvents(): DataChannelAdapterEvents {
		return {
			onOpen: (): void => {
				log.debug("DataChannel onOpen");
				const { sessionState } = appState.get();
				if (!sessionState.isHost) {
					this.startLatencyMonitoring();
				}
			},
			onClose: (): void => {
				log.debug("DataChannel onClose");
				abortRegistry.end();

				const { files } = fileTransferState.get();
				const interrupted: string[] = [];

				for (const file of files) {
					if (file.status === "in-transit") {
						fileTransferState.dispatch("SET_FILE_STATUS", {
							id: file.id,
							status: "error",
							errorMessage: "Connection lost"
						});
						interrupted.push(file.metadata.name);
					}
				}

				if (interrupted.length > 0) {
					toast.error(
						interrupted.length === 1
							? "Transfer interrupted"
							: `${interrupted.length} transfers interrupted`,
						{ description: interrupted.join(", ") }
					);
				}
			},
			onError: (event: RTCErrorEvent): void => {
				log.error("DataChannel onError", event.error);
				if (event.error) {
					appState.dispatch("SET_LAST_ERROR", {
						title: "Direct Connection Error",
						message:
							event.error instanceof Error
								? event.error.message
								: "An error occurred with the direct connection"
					});
				}
			},
			onMessage: (event: MessageEvent): void => {
				void this.handleDataChannelMessage(event);
			}
		};
	}

	private async handleDataChannelMessage(event: MessageEvent): Promise<void> {
		const { sessionState, webrtcState } = appState.get();

		if (sessionState.lastError || webrtcState.isConnecting) {
			appState.dispatch("SET_LAST_ERROR", null);
		}

		switch (true) {
			case event.data instanceof Blob: {
				const buffer = await event.data.arrayBuffer();
				this.messageBus.emit("in_file_transit", new Uint8Array(buffer));
				return;
			}
			case event.data instanceof ArrayBuffer: {
				this.messageBus.emit("in_file_transit", new Uint8Array(event.data));
				return;
			}
			case event.data instanceof Uint8Array: {
				this.messageBus.emit("in_file_transit", event.data);
				return;
			}
		}

		try {
			if (typeof event.data !== "string") {
				throw new Error("Invalid message format: expected string");
			}

			const { type, data } = JSON.parse(event.data) as WebRTCIncomingMessage;
			log.debug("Received a message of type:", type);
			this.messageBus.emit(type, data);
		} catch (error) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Message Error",
				message: error instanceof Error ? error.message : "Failed to parse incoming WebRTC message"
			});
		}
	}

	private rejectConnection(reason: string): void {
		const ws = getWebSocketClient();
		log.error(`Rejecting WebRTC connection: ${reason}`);
		this.disconnect();
		ws.emit({ type: "webrtc_reject", data: { reason } });
	}

	public async connect(): Promise<this> {
		const { sessionState } = appState.get();

		if (isWebRtcConnected()) {
			log.warn("WebRTC is already connected ~ cannot connect again");
			return this;
		}

		if (!sessionState.isHost) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Connection Error",
				message: "Only the host can initiate a direct connection"
			});

			return this;
		}

		log.info("Attempting to establish a WebRTC connection");

		appState.dispatch("UPDATE", { webrtcState: { isConnecting: true } });
		await sleep(500);

		try {
			const pc = this.createPeerConnection();
			const dc = pc.createDataChannelAdapter("peersend.io/rtc", this.createDataChannelEvents());
			const offer = await pc.createOffer();

			await pc.setLocalDescription(offer);

			if (!pc.localDescription) {
				throw new Error("Failed to establish a local description");
			}

			this.pc = pc;
			appState.dispatch("UPDATE", { webrtcState: { dataChannel: dc } });

			log.info("Created an offer and set local description, sending to peer via WebSocket");

			const ws = getWebSocketClient();
			ws.emit({
				type: "webrtc_offer",
				data: { description: pc.localDescription.toJSON() }
			});
		} catch (error) {
			log.error("Failed to establish a WebRTC connection");

			this.disconnect();
			appState.dispatch("SET_LAST_ERROR", {
				title: "Connection Issue",
				message: error instanceof Error ? error.message : "Unable to establish a direct connection"
			});
		}

		return this;
	}

	public async handleOffer(description: RTCSessionDescriptionInit): Promise<void> {
		const { sessionState } = appState.get();

		if (sessionState.isHost) {
			this.rejectConnection("Host cannot receive a WebRTC offer");
			return;
		}

		log.info("Received WebRTC offer, attempting to establish direct connection");

		try {
			const pc = this.createPeerConnection();
			this.pc = pc;

			const remoteDesc = new RTCSessionDescription(description);
			await pc.setRemoteDescription(remoteDesc);

			const answer = await pc.createAnswer();
			await pc.setLocalDescription(answer);

			if (!pc.remoteDescription || !pc.localDescription) {
				throw new Error("Failed to finalise local/remote descriptions");
			}

			const ws = getWebSocketClient();
			ws.emit({
				type: "webrtc_accept",
				data: { description: pc.localDescription.toJSON() }
			});
		} catch (error) {
			this.rejectConnection(
				error instanceof Error ? error.message : "Failed to handle remote offer"
			);
		}
	}

	public async handleAccept(description: RTCSessionDescriptionInit): Promise<void> {
		const { sessionState } = appState.get();

		if (!sessionState.isHost) {
			this.rejectConnection("A host must accept a WebRTC offer");
			return;
		}

		if (!this.pc) {
			this.rejectConnection("The host connection is faulty");
			return;
		}

		try {
			log.info("Received WebRTC answer, finalising direct connection");
			const remoteDesc = new RTCSessionDescription(description);
			await this.pc.setRemoteDescription(remoteDesc);
		} catch {
			this.rejectConnection("Failed to establish a direct connection");
		}
	}

	public async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
		if (!this.pc) {
			this.rejectConnection("Direct connection is faulty");
			return;
		}

		try {
			log.info("Adding received ICE candidate to peer connection");
			const iceCandidate = new RTCIceCandidate(candidate);
			await this.pc.addIceCandidate(iceCandidate);
		} catch {
			this.rejectConnection("Failed to establish a direct connection");
		}
	}

	public disconnect(): this {
		const { webrtcState } = appState.get();

		if (webrtcState.dataChannel) {
			webrtcState.dataChannel.close();
		}

		if (this.pc) {
			this.pc.close();
			this.pc = null;
		}

		this.stopLatencyMonitoring();
		this.reset();

		if (isWebSocketConnected()) {
			const ws = getWebSocketClient();
			ws.startLatencyMonitoring();
		}

		log.info("Disconnected");

		return this;
	}

	public reset(): this {
		appState.dispatch("UPDATE", {
			sessionState: { connectionType: "websocket" },
			webrtcState: DEFAULT_WEBRTC_STATE
		});

		log.debug("State has been reset");
		return this;
	}

	public emit(event: WebRTCOutgoingMessage): this {
		const { webrtcState } = appState.get();

		if (!isWebRtcConnected()) {
			log.error(`Cannot emit WebRTC event when not connected: ${event.type}`);
			return this;
		}

		log.debug(`Emitting event: ${event.type}`);

		if (event.type === "in_file_transit") {
			webrtcState.dataChannel!.send(event.data);
		} else {
			const payload = JSON.stringify(event);
			webrtcState.dataChannel!.send(payload);
		}

		return this;
	}
}
