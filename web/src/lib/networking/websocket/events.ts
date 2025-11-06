import type {
	WebSocketDataSessionInformation,
	WebSocketDataPong,
	WebSocketDataSyncClients,
	WebSocketDataHostTransfer,
	WebSocketDataWebRTCOffer,
	WebSocketDataWebRTCAccept,
	WebSocketDataWebRTCIceCandidate,
	WebSocketDataWebRTCReject,
	WebSocketDataError,
	WebSocketIncomingMessage
} from "./types";
import type { NetworkEvents } from "../types";

import { appState } from "@/state";

import { CustomRTCPeerConnection } from "../webrtc";
import { getWebSocketClient, getWebRTCClient } from "../utils";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebSocketEvents");

const RTC_CONFIGURATION: RTCConfiguration = {
	iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
};

function event_SessionInformation(data: WebSocketDataSessionInformation) {
	appState.dispatch("SET_SESSION_INFORMATION", data);
	getWebSocketClient().startLatencyMonitoring();
}

function event_Pong(data: WebSocketDataPong) {
	getWebSocketClient().latencyChecker.pong(data);
}

function event_SyncClients(data: WebSocketDataSyncClients) {
	const { sessionState } = appState.get();

	if (sessionState.clients.length > data.clients.length) {
		log.warn("There was a discrepancy in the client list, resetting direct connections.");
		getWebRTCClient().disconnect();
	}

	appState.dispatch("SET_CLIENTS", data);
}

function event_HostTransferred(data: WebSocketDataHostTransfer) {
	appState.dispatch("SET_HOST", data);
}

async function event_WebRTCOffer(data: WebSocketDataWebRTCOffer) {
	const { sessionState } = appState.get();

	if (sessionState.isHost) {
		log.error("A host cannot receive a WebRTC offer");
		getWebRTCClient().disconnect();
		getWebSocketClient().emit({
			type: "webrtc_reject",
			data: {
				reason: "Host cannot receive a WebRTC offer"
			}
		});

		return;
	}

	log.info("Received WebRTC offer, attempting to establish direct connection");

	try {
		const pc = new CustomRTCPeerConnection(RTC_CONFIGURATION);

		appState.dispatch("UPDATE", {
			webrtcState: {
				peerConnection: pc
			}
		});

		const description = new RTCSessionDescription(data.description);
		await pc.setRemoteDescription(description);

		const answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		if (!pc.remoteDescription || !pc.localDescription) {
			throw new Error("Failed");
		}

		getWebSocketClient().emit({
			type: "webrtc_accept",
			data: {
				description: pc.localDescription.toJSON()
			}
		});
	} catch (error) {
		log.error("Failed to handle WebRTC offer, disconnecting", error);
		getWebRTCClient().disconnect();
		getWebSocketClient().emit({
			type: "webrtc_reject",
			data: {
				reason: error instanceof Error ? error.message : "Failed to handle remote offer"
			}
		});
	}
}

async function event_WebRTCAccept(data: WebSocketDataWebRTCAccept) {
	const { sessionState, webrtcState } = appState.get();

	if (!sessionState.isHost) {
		log.error("Only a host can accept a WebRTC offer");
		getWebRTCClient().disconnect();
		getWebSocketClient().emit({
			type: "webrtc_reject",
			data: {
				reason: "A host must accept a WebRTC offer"
			}
		});
		return;
	}

	if (!webrtcState.peerConnection) {
		log.error("Peer connection does not exist, cannot accept WebRTC offer");
		getWebRTCClient().disconnect();
		getWebSocketClient().emit({
			type: "webrtc_reject",
			data: {
				reason: "The host connection is faulty"
			}
		});
		return;
	}

	try {
		log.info("Received WebRTC answer, finalising direct connection");

		const description = new RTCSessionDescription(data.description);
		await webrtcState.peerConnection.setRemoteDescription(description);
	} catch (error) {
		log.error("Failed to handle WebRTC answer, disconnecting", error);

		getWebRTCClient().disconnect();
		getWebSocketClient().emit({
			type: "webrtc_reject",
			data: {
				reason: "Failed to establish a direct connection"
			}
		});
	}
}

async function event_WebRTCIceCandidate(data: WebSocketDataWebRTCIceCandidate) {
	const { webrtcState } = appState.get();

	if (!webrtcState.peerConnection) {
		log.error("Peer connection does not exist, cannot add ICE candidate");
		getWebRTCClient().disconnect();
		getWebSocketClient().emit({
			type: "webrtc_reject",
			data: {
				reason: "Direct connection is faulty"
			}
		});
		// need to maybe add error messages here for the client
		return;
	}

	try {
		log.info("Adding received ICE candidate to peer connection");

		const candidate = new RTCIceCandidate(data.candidate);
		await webrtcState.peerConnection.addIceCandidate(candidate);
	} catch {
		getWebRTCClient().disconnect();
		getWebSocketClient().emit({
			type: "webrtc_reject",
			data: {
				reason: "Failed to establish a direct connection"
			}
		});
	}
}

function event_WebRTCReject(data: WebSocketDataWebRTCReject) {
	log.error(`WebRTC connection was rejected: ${data.reason}`);
	getWebSocketClient().disconnect();

	appState.dispatch("SET_LAST_ERROR", {
		title: "Direct Connection Failed",
		message: data.reason
	});
}

function event_Error(data: WebSocketDataError) {
	log.error(`"WebSocket received an error`);

	appState.dispatch("SET_LAST_ERROR", {
		title: data.type,
		message: data.reason
	});
}

export const events: NetworkEvents<WebSocketIncomingMessage> = {
	session_information: event_SessionInformation,
	sync_clients: event_SyncClients,
	pong: event_Pong,
	host_transferred: event_HostTransferred,
	webrtc_accept: event_WebRTCAccept,
	webrtc_reject: event_WebRTCReject,
	webrtc_offer: event_WebRTCOffer,
	webrtc_ice_candidate: event_WebRTCIceCandidate,
	error: event_Error
};
