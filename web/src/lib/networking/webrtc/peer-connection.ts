import { appState } from "@/state";
import { CustomDataChannel } from "./data-channel";
import { createLogger } from "@/utils/logger";
import { getWebRTCClient, getWebSocketClient } from "../utils";

const log = createLogger("CustomRTCPeerConnection");

export class CustomRTCPeerConnection extends RTCPeerConnection {
	constructor(config: RTCConfiguration) {
		super(config);

		this.addEventListener("icecandidate", this.onICECandiate.bind(this));
		this.addEventListener("icecandidateerror", this.onICECandiateError.bind(this));
		this.addEventListener("iceconnectionstatechange", this.onICECandiateStateChange.bind(this));
		this.addEventListener("connectionstatechange", this.onConnectionStateChange.bind(this));
		this.addEventListener("datachannel", this.onDataChannel.bind(this));
	}

	private onICECandiate(event: RTCPeerConnectionIceEvent): void {
		log.debug("onICECandiate");

		if (event.candidate) {
			getWebSocketClient().emit({
				type: "webrtc_ice_candidate",
				data: {
					candidate: event.candidate.toJSON()
				}
			});
		}
	}

	private onICECandiateError(): void {
		log.error("onICECandiateError");
	}

	private onICECandiateStateChange(): void {
		log.debug("onICECandiateStateChange");

		const { webrtcState } = appState.get();

		if (!webrtcState.peerConnection) {
			return;
		}
	}

	private onConnectionStateChange(): void {
		log.debug("onConnectionStateChange");

		const { webrtcState } = appState.get();

		if (!webrtcState.peerConnection) {
			return;
		}

		log.debug(`Connection state changed to: ${webrtcState.peerConnection.connectionState}`);

		switch (webrtcState.peerConnection.connectionState) {
			case "connected":
				appState.dispatch("UPDATE", {
					sessionState: {
						connectionType: "webrtc"
					},
					webrtcState: {
						isConnected: true,
						isConnecting: false
					}
				});

				getWebSocketClient().stopLatencyMonitoring();
				getWebRTCClient().startLatencyMonitoring();

				break;
			case "disconnected":
			case "failed":
			case "closed":
				getWebRTCClient().disconnect();
		}
	}

	private onDataChannel(event: RTCDataChannelEvent): void {
		log.info("Data channel established by remote peer");

		appState.dispatch("UPDATE", {
			webrtcState: {
				dataChannel: new CustomDataChannel(event.channel)
			}
		});
	}

	public createCustomDataChannel(label: string): CustomDataChannel {
		const dc = this.createDataChannel(label);
		return new CustomDataChannel(dc);
	}
}
