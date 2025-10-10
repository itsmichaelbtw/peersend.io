import type { WebRtcMessages } from "./types";

import { NetworkClient } from "../network-client";
import { webSocketClient } from "../websocket";
import { WebRtcLatencyChecker } from "./latency-checker";
import { CustomRTCPeerConnection } from "./peer-connection";
import { events } from "./events";

import { appState, isWebRtcConnected } from "@/state";
import { sleep } from "@/utils/sleep";
import { DEFAULT_WEBRTC_STATE } from "@/config/constants";

const RTC_CONFIGURATION: RTCConfiguration = {
	iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
};

export class WebRtcClient extends NetworkClient<
	WebRtcMessages.IncomingMessage,
	WebRtcMessages.OutgoingMessage
> {
	constructor() {
		super(new WebRtcLatencyChecker());

		this.register_events(events);
	}

	public async connect(): Promise<void> {
		const { sessionState } = appState.get();

		if (isWebRtcConnected()) {
			return;
		}

		if (!sessionState.isHost) {
			appState.dispatch("SET_LAST_ERROR", {
				title: "Connection Error",
				message: "Only the host can initiate a direct connection"
			});

			return;
		}

		appState.dispatch("UPDATE", { webrtcState: { isConnecting: true } });
		await sleep(500);

		try {
			const pc = new CustomRTCPeerConnection(RTC_CONFIGURATION);
			const dc = pc.create_data_channel("peersend.io/rtc");
			const offer = await pc.createOffer();

			await pc.setLocalDescription(offer);

			if (!pc.localDescription) {
				throw new Error("Failed to establish a local description");
			}

			appState.dispatch("UPDATE", {
				webrtcState: {
					dataChannel: dc,
					peerConnection: pc
				}
			});

			webSocketClient.emit({
				type: "webrtc_offer",
				data: {
					description: pc.localDescription.toJSON()
				}
			});
		} catch (error) {
			this.disconnect();
			appState.dispatch("SET_LAST_ERROR", {
				title: "Connection Issue",
				message:
					error instanceof Error ? error.message : "Unable to establish a direction connection"
			});
		}
	}

	public async disconnect(): Promise<void> {
		const { webrtcState } = appState.get();

		if (webrtcState.dataChannel) {
			webrtcState.dataChannel.close();
		}

		if (webrtcState.peerConnection) {
			webrtcState.peerConnection.close();
		}

		this.stop_latency_monitoring();
		this.reset();

		webSocketClient.start_latency_monitoring();
	}

	public reset(): void {
		appState.dispatch("UPDATE", {
			sessionState: {
				connectionType: "websocket"
			},
			webrtcState: DEFAULT_WEBRTC_STATE
		});
	}

	public emit(event: WebRtcMessages.OutgoingMessage): void {
		const { webrtcState } = appState.get();

		if (!isWebRtcConnected()) {
			return;
		}

		if (event.type === "in_file_transit") {
			webrtcState.dataChannel!.send(event.data);
		} else {
			const payload = JSON.stringify(event);
			webrtcState.dataChannel!.send(payload);
		}
	}
}

export const webrtcClient = new WebRtcClient();
