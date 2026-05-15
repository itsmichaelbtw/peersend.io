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
import type { WebSocketClient } from "./client";
import type { WebRTCClient } from "../webrtc/client";

import type { SessionState, WebRTCConnectionState } from "@/state";

import { appState } from "@/state";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebSocketEvents");

function canWebRTCAutoConnect(
	sessionState: SessionState,
	webrtcState: WebRTCConnectionState,
	incomingClientCount: number
): boolean {
	return (
		sessionState.autoWebRTC &&
		sessionState.isHost &&
		incomingClientCount === sessionState.maximumClients &&
		!webrtcState.isConnected &&
		!webrtcState.isConnecting
	);
}

export interface WebSocketHandlerContext {
	ws: WebSocketClient;
	rtc: WebRTCClient;
}

export const messageHandlers: NetworkEvents<WebSocketIncomingMessage, WebSocketHandlerContext> = {
	session_information(data: WebSocketDataSessionInformation, ctx: WebSocketHandlerContext): void {
		appState.dispatch("SET_SESSION_INFORMATION", data);
		ctx.ws.startLatencyMonitoring();
	},

	pong(data: WebSocketDataPong, ctx: WebSocketHandlerContext): void {
		ctx.ws.pong(data);
	},

	sync_clients(data: WebSocketDataSyncClients, ctx: WebSocketHandlerContext): void {
		const { sessionState, webrtcState } = appState.get();

		if (sessionState.clients.length > data.clients.length) {
			if (webrtcState.isConnected || webrtcState.isConnecting) {
				log.warn("There was a discrepancy in the client list, resetting direct connections.");
				ctx.rtc.disconnect();
			}
		}

		appState.dispatch("SET_CLIENTS", data);

		const { sessionState: updatedSession, webrtcState: updatedWebrtc } = appState.get();

		if (canWebRTCAutoConnect(updatedSession, updatedWebrtc, data.clients.length)) {
			log.info("Auto WebRTC enabled and session is full — initiating direct connection automatically");
			void ctx.rtc.connect();
		}
	},

	host_transferred(data: WebSocketDataHostTransfer): void {
		appState.dispatch("SET_HOST", data);
	},

	async webrtc_offer(data: WebSocketDataWebRTCOffer, ctx: WebSocketHandlerContext): Promise<void> {
		await ctx.rtc.handleOffer(data.description);
	},

	async webrtc_accept(
		data: WebSocketDataWebRTCAccept,
		ctx: WebSocketHandlerContext
	): Promise<void> {
		await ctx.rtc.handleAccept(data.description);
	},

	async webrtc_ice_candidate(
		data: WebSocketDataWebRTCIceCandidate,
		ctx: WebSocketHandlerContext
	): Promise<void> {
		await ctx.rtc.handleIceCandidate(data.candidate);
	},

	webrtc_reject(data: WebSocketDataWebRTCReject, ctx: WebSocketHandlerContext): void {
		log.error(`WebRTC connection was rejected: ${data.reason}`);
		ctx.ws.disconnect();

		appState.dispatch("SET_LAST_ERROR", {
			title: "Direct Connection Failed",
			message: data.reason
		});
	},

	error(data: WebSocketDataError): void {
		log.error("WebSocket received an error");

		appState.dispatch("SET_LAST_ERROR", {
			title: data.type,
			message: data.reason
		});
	}
};
