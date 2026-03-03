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
import { getWebSocketClient, getWebRTCClient } from "../client-registry";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebSocketEvents");

const RTC_CONFIGURATION: RTCConfiguration = {
	iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
};

function rejectWebRTCConnection(reason: string): void {
	const rtc = getWebRTCClient();
	const ws = getWebSocketClient();

	log.error(`Rejecting WebRTC connection: ${reason}`);
	rtc.disconnect();
	ws.emit({ type: "webrtc_reject", data: { reason } });
}

function handleSessionInformation(data: WebSocketDataSessionInformation): void {
	const ws = getWebSocketClient();
	appState.dispatch("SET_SESSION_INFORMATION", data);
	ws.startLatencyMonitoring();
}

function handlePong(data: WebSocketDataPong): void {
	const ws = getWebSocketClient();
	ws.latencyChecker.pong(data);
}

function handleSyncClients(data: WebSocketDataSyncClients): void {
	const { sessionState } = appState.get();

	if (sessionState.clients.length > data.clients.length) {
		const rtc = getWebRTCClient();
		log.warn("There was a discrepancy in the client list, resetting direct connections.");
		rtc.disconnect();
	}

	appState.dispatch("SET_CLIENTS", data);
}

function handleHostTransferred(data: WebSocketDataHostTransfer): void {
	appState.dispatch("SET_HOST", data);
}

async function handleWebRTCOffer(data: WebSocketDataWebRTCOffer): Promise<void> {
	const { sessionState } = appState.get();

	if (sessionState.isHost) {
		rejectWebRTCConnection("Host cannot receive a WebRTC offer");
		return;
	}

	log.info("Received WebRTC offer, attempting to establish direct connection");

	try {
		const pc = new CustomRTCPeerConnection(RTC_CONFIGURATION);

		appState.dispatch("UPDATE", { webrtcState: { peerConnection: pc } });

		const description = new RTCSessionDescription(data.description);
		await pc.setRemoteDescription(description);

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
		rejectWebRTCConnection(error instanceof Error ? error.message : "Failed to handle remote offer");
	}
}

async function handleWebRTCAccept(data: WebSocketDataWebRTCAccept): Promise<void> {
	const { sessionState, webrtcState } = appState.get();

	if (!sessionState.isHost) {
		rejectWebRTCConnection("A host must accept a WebRTC offer");
		return;
	}

	if (!webrtcState.peerConnection) {
		rejectWebRTCConnection("The host connection is faulty");
		return;
	}

	try {
		log.info("Received WebRTC answer, finalising direct connection");

		const description = new RTCSessionDescription(data.description);
		await webrtcState.peerConnection.setRemoteDescription(description);
	} catch {
		rejectWebRTCConnection("Failed to establish a direct connection");
	}
}

async function handleWebRTCIceCandidate(data: WebSocketDataWebRTCIceCandidate): Promise<void> {
	const { webrtcState } = appState.get();

	if (!webrtcState.peerConnection) {
		rejectWebRTCConnection("Direct connection is faulty");
		// need to maybe add error messages here for the client
		return;
	}

	try {
		log.info("Adding received ICE candidate to peer connection");

		const candidate = new RTCIceCandidate(data.candidate);
		await webrtcState.peerConnection.addIceCandidate(candidate);
	} catch {
		rejectWebRTCConnection("Failed to establish a direct connection");
	}
}

function handleWebRTCReject(data: WebSocketDataWebRTCReject): void {
	const ws = getWebSocketClient();
	log.error(`WebRTC connection was rejected: ${data.reason}`);
	ws.disconnect();

	appState.dispatch("SET_LAST_ERROR", {
		title: "Direct Connection Failed",
		message: data.reason
	});
}

function handleError(data: WebSocketDataError): void {
	log.error("WebSocket received an error");

	appState.dispatch("SET_LAST_ERROR", {
		title: data.type,
		message: data.reason
	});
}

export const messageHandlers: NetworkEvents<WebSocketIncomingMessage> = {
	session_information: handleSessionInformation,
	sync_clients: handleSyncClients,
	pong: handlePong,
	host_transferred: handleHostTransferred,
	webrtc_accept: handleWebRTCAccept,
	webrtc_reject: handleWebRTCReject,
	webrtc_offer: handleWebRTCOffer,
	webrtc_ice_candidate: handleWebRTCIceCandidate,
	error: handleError
};

