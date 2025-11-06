import type { EncryptionModes, NetworkConnectionTypes } from "@/state/types";
import type { NetworkMessagePayload } from "../types";
import type { PongData } from "../core/latency-checker";

export interface WebSocketDataWebRTCOffer {
	description: RTCSessionDescriptionInit;
}

export interface WebSocketDataWebRTCReject {
	reason: string;
}

export interface WebSocketDataWebRTCAccept {
	description: RTCSessionDescriptionInit;
}

export interface WebSocketDataWebRTCIceCandidate {
	candidate: RTCIceCandidateInit;
}

export interface WebSocketDataSessionInformation
	extends WebSocketDataHostTransfer,
		WebSocketDataSyncClients {
	session_code: string;
	client_id: string;
	maximum_clients: number;
	connection_type: NetworkConnectionTypes;
	encryption_mode: EncryptionModes;
	auto_webrtc: boolean;
}

export interface WebSocketDataHostTransfer {
	host_id: string;
}

export interface WebSocketDataSyncClients {
	clients: string[];
}

export interface WebSocketDataSessionFull {
	maximum_clients: number;
	session_code: string;
}

export interface WebSocketDataPing {
	client_timestamp: number;
}

export interface WebSocketDataPong extends PongData {}

export interface WebSocketDataError {
	type: string;
	reason: string;
}

interface WebSocketCommonEvents {
	webrtc_offer: {
		description: RTCSessionDescriptionInit;
	};
	webrtc_reject: {
		reason: string;
	};
	webrtc_accept: {
		description: RTCSessionDescriptionInit;
	};
	webrtc_ice_candidate: {
		candidate: RTCIceCandidateInit;
	};
}

export interface WebSocketEventMapIncomingEvents extends WebSocketCommonEvents {
	session_information: WebSocketDataSessionInformation;
	sync_clients: WebSocketDataSyncClients;
	host_transferred: WebSocketDataHostTransfer;
	pong: WebSocketDataPong;
	error: WebSocketDataError;
}

export interface WebSocketEventMapOutgoingEvents extends WebSocketCommonEvents {
	ping: Pick<WebSocketDataPong, "client_timestamp">;
	transfer_host: null;
}

export type WebSocketEventsIncomingTypes = keyof WebSocketEventMapIncomingEvents;
export type WebSocketEventsOutgoingTypes = keyof WebSocketEventMapOutgoingEvents;

export type WebSocketIncomingMessage = {
	[K in keyof WebSocketEventMapIncomingEvents]: NetworkMessagePayload<
		K,
		WebSocketEventMapIncomingEvents[K]
	>;
}[keyof WebSocketEventMapIncomingEvents];

export type WebSocketOutgoingMessage = {
	[K in keyof WebSocketEventMapOutgoingEvents]: NetworkMessagePayload<
		K,
		WebSocketEventMapOutgoingEvents[K]
	>;
}[keyof WebSocketEventMapOutgoingEvents];
