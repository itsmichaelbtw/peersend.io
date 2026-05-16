import type { FileTransferState, PeerSendFile } from "../types";

import { FileTransferStore } from "./store";

const initialState: FileTransferState = {
	files: [],
	fileIds: new Set()
};

export const fileTransferState = new FileTransferStore(initialState);

export function getFileTransferState(): FileTransferState {
	return fileTransferState.get();
}

export function getPeersendFile(id: string): PeerSendFile | undefined {
	return getFileTransferState().files.find((f) => f.id === id);
}

export function hasPeersendFile(id: string): boolean {
	return getFileTransferState().fileIds.has(id);
}
