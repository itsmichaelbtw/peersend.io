import type { DataChannelAdapterEvents } from "./data-channel-adapter";

import { DataChannelAdapter } from "./data-channel-adapter";

export interface PeerConnectionAdapterEvents {
	onIceCandidate(event: RTCPeerConnectionIceEvent): void;
	onIceCandidateError(): void;
	onIceConnectionStateChange(): void;
	onConnectionStateChange(): void;
	onDataChannel(event: RTCDataChannelEvent): void;
}

export class PeerConnectionAdapter {
	private readonly pc: RTCPeerConnection;

	constructor(config: RTCConfiguration, events: PeerConnectionAdapterEvents) {
		this.pc = new RTCPeerConnection(config);
		this.pc.addEventListener("icecandidate", (e) => events.onIceCandidate(e));
		this.pc.addEventListener("icecandidateerror", () => events.onIceCandidateError());
		this.pc.addEventListener("iceconnectionstatechange", () => events.onIceConnectionStateChange());
		this.pc.addEventListener("connectionstatechange", () => events.onConnectionStateChange());
		this.pc.addEventListener("datachannel", (e) => events.onDataChannel(e));
	}

	public get connectionState(): RTCPeerConnectionState {
		return this.pc.connectionState;
	}

	public get localDescription(): RTCSessionDescription | null {
		return this.pc.localDescription;
	}

	public get remoteDescription(): RTCSessionDescription | null {
		return this.pc.remoteDescription;
	}

	public async createOffer(): Promise<RTCSessionDescriptionInit> {
		return this.pc.createOffer();
	}

	public async createAnswer(): Promise<RTCSessionDescriptionInit> {
		return this.pc.createAnswer();
	}

	public async setLocalDescription(description: RTCLocalSessionDescriptionInit): Promise<void> {
		return this.pc.setLocalDescription(description);
	}

	public async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
		return this.pc.setRemoteDescription(description);
	}

	public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
		return this.pc.addIceCandidate(candidate);
	}

	public createDataChannelAdapter(
		label: string,
		events: DataChannelAdapterEvents
	): DataChannelAdapter {
		const dc = this.pc.createDataChannel(label);
		return new DataChannelAdapter(dc, events);
	}

	public close(): void {
		this.pc.close();
	}
}
