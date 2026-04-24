import type { FileWithPath } from "react-dropzone";
import type { DataChannelAdapter, WebSocketAdapter } from "@/lib/networking";
import type { WithNullable } from "@/types/misc";

export type FileTransferType = "incoming" | "outgoing";
export type EncryptionModes = "none";
export type NetworkConnectionTypes = "websocket" | "webrtc" | "none";

export type FileContentBytes = Uint8Array;

export interface ConnectionState {
	isConnected: boolean;
	isConnecting: boolean;
}

export interface ConnectionErrorData {
	title: string;
	message: string;
}

export interface WebRTCConnectionState extends ConnectionState {
	dataChannel: WithNullable<DataChannelAdapter>;
}

export interface WebSocketConnectionState extends ConnectionState {
	ws: WithNullable<WebSocketAdapter>;
}

export interface AppState {
	sessionState: SessionState;
	webrtcState: WebRTCConnectionState;
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

export interface FileTransferState {
	files: PeerSendFile[];
}

export interface PeerSendFile<T extends FileTransferType = FileTransferType> {
	id: string;
	timestamp: number;
	status: "pending" | "in-transit" | "sent" | "received" | "error";
	errorMessage?: string;
	transfer: {
		type: T;
		percentage: number;
	};
	metadata: Pick<FileWithPath, "name" | "path" | "size" | "type" | "lastModified">;
	nativeFile: FileWithPath | null;
}
