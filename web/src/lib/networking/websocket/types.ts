import type { EncryptionModes, NetworkConnectionTypes } from "@/state/types";
import type { NetworkMessagePayload } from "../types";
import type { PongData } from "../core/latency-checker";

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

export namespace WebSocketEventMap {
	export interface IncomingEvents extends WebSocketCommonEvents {
		session_information: {
			session_code: string;
			client_id: string;
			maximum_clients: number;
			connection_type: NetworkConnectionTypes;
			encryption_mode: EncryptionModes;
			auto_webrtc: boolean;
			is_host: boolean;
			clients: string[];
		};
		sync_online_clients: {
			clients: string[];
		};
		host_transferred: {
			is_host: boolean;
		};
		pong: PongData;
		error: {
			type: string;
			reason: string;
		};
	}

	export interface OutgoingEvents extends WebSocketCommonEvents {
		ping: Pick<PongData, "client_timestamp">;
		transfer_host: null;
	}
}

export namespace WebSocketEvents {
	export type IncomingTypes = keyof WebSocketEventMap.IncomingEvents;
	export type OutgoingTypes = "";
}

export namespace WebSocketMessages {
	export type IncomingMessage = {
		[K in keyof WebSocketEventMap.IncomingEvents]: NetworkMessagePayload<
			K,
			WebSocketEventMap.IncomingEvents[K]
		>;
	}[keyof WebSocketEventMap.IncomingEvents];

	export type OutgoingMessage = {
		[K in keyof WebSocketEventMap.OutgoingEvents]: NetworkMessagePayload<
			K,
			WebSocketEventMap.OutgoingEvents[K]
		>;
	}[keyof WebSocketEventMap.OutgoingEvents];
}
