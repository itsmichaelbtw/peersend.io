import type { NetworkClients } from "../utils";

import { appState } from "@/state";
import { CustomDataChannel } from "./data-channel";
import { getNetworkingClients } from "../utils";
import { createLogger } from "@/utils/logger";

const log = createLogger("CustomRTCPeerConnection");

export class CustomRTCPeerConnection extends RTCPeerConnection {
	private network_clients: NetworkClients;

	constructor(config: RTCConfiguration) {
		super(config);

		this.network_clients = getNetworkingClients();

		this.addEventListener("icecandidate", this.on_icecandidate.bind(this));
		this.addEventListener("icecandidateerror", this.on_icecandidateerror.bind(this));
		this.addEventListener("iceconnectionstatechange", this.on_iceconnectionstatechange.bind(this));
		this.addEventListener("connectionstatechange", this.on_connectionstatechange.bind(this));
		this.addEventListener("datachannel", this.on_datachannel.bind(this));
	}

	private on_icecandidate(event: RTCPeerConnectionIceEvent) {
		log.debug("on_icecandidate");

		if (event.candidate) {
			this.network_clients.ws.emit({
				type: "webrtc_ice_candidate",
				data: {
					candidate: event.candidate.toJSON()
				}
			});
		}
	}

	private on_icecandidateerror(event: Event) {
		log.error("on_icecandidateerror");
	}

	private on_iceconnectionstatechange(event: Event) {
		log.debug("on_iceconnectionstatechange");

		const { webrtcState } = appState.get();

		if (!webrtcState.peerConnection) {
			return;
		}
	}

	private on_connectionstatechange(event: Event) {
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

				this.network_clients.ws.stop_latency_monitoring();
				this.network_clients.wrtc.start_latency_monitoring();

				break;
			case "disconnected":
			case "failed":
			case "closed":
				this.network_clients.wrtc.disconnect();
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
