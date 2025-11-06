import { WebRTCClient } from "./webrtc";
import { WebSocketClient } from "./websocket";
import { WEBSOCKET_ENDPOINT } from "@/config/constants";

let webSocketClient: WebSocketClient | null = null;
let webRTCClient: WebRTCClient | null = null;

export function getWebRTCClient(): WebRTCClient {
	return webRTCClient ? webRTCClient : new WebRTCClient();
}

export function getWebSocketClient(): WebSocketClient {
	return webSocketClient ? webSocketClient : new WebSocketClient(WEBSOCKET_ENDPOINT);
}
