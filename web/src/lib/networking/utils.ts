import { WebRTCClient } from "./webrtc";
import { WebSocketClient } from "./websocket";
import { envVar } from "@/config/constants";

let webSocketClient: WebSocketClient | null = null;
let webRTCClient: WebRTCClient | null = null;

export function getWebRTCClient(): WebRTCClient {
	if (webRTCClient === null) {
		webRTCClient = new WebRTCClient();
	}

	return webRTCClient;
}

export function getWebSocketClient(): WebSocketClient {
	if (webSocketClient === null) {
		webSocketClient = new WebSocketClient(envVar.WEBSOCKET_ENDPOINT);
	}

	return webSocketClient;
}
