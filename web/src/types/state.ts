import type { CustomDataChannel, CustomRTCPeerConnection, CustomWebSocket } from "@/lib/networking";
import type { WithNullable } from "./misc";

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
}

export interface CustomFile {
  id: string;
  timestamp: number;
  file: File;
}

export interface ConnectionErrorData {
  title: string;
  message: string;
}

export interface WebRtcConnectionState extends ConnectionState {
  dataChannel: WithNullable<CustomDataChannel>;
  peerConnection: WithNullable<CustomRTCPeerConnection>;
}

export interface WebSocketConnectionState extends ConnectionState {
  ws: WithNullable<CustomWebSocket>;
}

export type EncryptionModes = "none";
export type NetworkConnectionTypes = "websocket" | "webrtc" | "none";

export interface AppState {
  sessionState: SessionState;
  webrtcState: WebRtcConnectionState;
  websocketState: WebSocketConnectionState;
}

export interface SessionState {
  sessionCode: WithNullable<string>;
  isHost: boolean;
  isConnected: boolean;
  autoWebRTC: boolean;
  encryptionMode: EncryptionModes;
  latency: number;
  clientId: WithNullable<string>;
  clients: string[];
  maximumClients: number;
  lastError: WithNullable<ConnectionErrorData>;
  connectionType: NetworkConnectionTypes;
}

export interface FileState {
  incomingFiles: CustomFile[];
  outgoingFiles: CustomFile[];
  isSending: boolean;
  isReceiving: boolean;
}
