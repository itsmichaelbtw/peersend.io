import type { PeerSendFile } from "@/state/types";
import type { PongData } from "../core/latency-checker";
import type { NetworkMessagePayload } from "../types";

export interface WebRTCDataPing {
	client_timestamp: number;
}

export interface WebRTCDataPong extends PongData {}

export interface WebRTCDataStartFileTransit {
	id: string;
	transferSize: number;
	metadata: PeerSendFile["metadata"];
}

export type WebRTCDataInFileTransit = Uint8Array;

export interface WebRTCDataEndFileTransit {
	id: string;
}

export interface WebRTCDataError {
	type: string;
	reason: string;
}

interface WebRTCCommonEvents {
	ping: WebRTCDataPing;
	pong: WebRTCDataPong;
	start_file_transit: WebRTCDataStartFileTransit;
	in_file_transit: WebRTCDataInFileTransit;
	end_file_transit: WebRTCDataEndFileTransit;
}

export interface WebRTCEventMapIncomingEvents extends WebRTCCommonEvents {
	error: WebRTCDataError;
}

export interface WebRTCEventMapOutgoingEvents extends WebRTCCommonEvents {}

export type WebRTCEventsIncomingTypes = keyof WebRTCEventMapIncomingEvents;
export type WebRTCEventsOutgoingTypes = keyof WebRTCEventMapOutgoingEvents;

export type WebRTCIncomingMessage = {
	[K in keyof WebRTCEventMapIncomingEvents]: NetworkMessagePayload<
		K,
		WebRTCEventMapIncomingEvents[K]
	>;
}[keyof WebRTCEventMapIncomingEvents];

export type WebRTCOutgoingMessage = {
	[K in keyof WebRTCEventMapOutgoingEvents]: NetworkMessagePayload<
		K,
		WebRTCEventMapOutgoingEvents[K]
	>;
}[keyof WebRTCEventMapOutgoingEvents];
