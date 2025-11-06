import { appState } from "@/state";
import { CustomDataChannel } from "./data-channel";
import { createLogger } from "@/utils/logger";
import { getWebRTCClient, getWebSocketClient } from "../utils";

const log = createLogger("CustomRTCPeerConnection");

export class CustomRTCPeerConnection extends RTCPeerConnection {
	constructor(config: RTCConfiguration) {
		super(config);

		this.addEventListener("icecandidate", this.on_icecandidate.bind(this));
		this.addEventListener("icecandidateerror", this.on_icecandidateerror.bind(this));
		this.addEventListener("iceconnectionstatechange", this.on_iceconnectionstatechange.bind(this));
		this.addEventListener("connectionstatechange", this.on_connectionstatechange.bind(this));
		this.addEventListener("datachannel", this.on_datachannel.bind(this));
	}

	private on_icecandidate(event: RTCPeerConnectionIceEvent) {
		log.debug("on_icecandidate");

		if (event.candidate) {
			getWebSocketClient().emit({
				type: "webrtc_ice_candidate",
				data: {
					candidate: event.candidate.toJSON()
				}
			});
		}
	}

	private on_icecandidateerror() {
		log.error("on_icecandidateerror");
	}

	private on_iceconnectionstatechange() {
		log.debug("on_iceconnectionstatechange");

		const { webrtcState } = appState.get();

		if (!webrtcState.peerConnection) {
			return;
		}
	}

	private on_connectionstatechange() {
		log.debug("on_connectionstatechange");

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

	private on_datachannel(event: RTCDataChannelEvent) {
		log.info("Data channel established by remote peer");

		appState.dispatch("UPDATE", {
			webrtcState: {
				dataChannel: new CustomDataChannel(event.channel)
			}
		});
	}

	public create_data_channel(label: string): CustomDataChannel {
		const dc = this.createDataChannel(label);
		return new CustomDataChannel(dc);
	}
}
