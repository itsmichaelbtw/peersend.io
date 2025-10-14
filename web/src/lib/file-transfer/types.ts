import type { PeerSendFile } from "@/state";

export type FileType = File | ArrayBuffer | Uint8Array;
export type FileTransferStatus = "complete" | "error";

export interface FileStorageRecord {
	chunks: Uint8Array[];
	received: number;
	size: number;
	complete: boolean;
}

export interface FileTransferTransport {
	start(id: string, transferSize: number, metadata: PeerSendFile["metadata"]): Promise<void>;
	chunk(id: string, chunk: Uint8Array, percentage: number): Promise<void>;
	error(id: string, message: string): Promise<void>;
	complete(id: string): Promise<void>;
}
