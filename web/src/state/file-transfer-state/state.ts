import type { FileTransferState, PeerSendFile } from "../types";

import { FileTransferStore } from "./store";

const initialState: FileTransferState = {
	files: []
};

export const fileTransferState = new FileTransferStore(initialState);

export function getFileTransferState() {
	return fileTransferState.get();
}

export function getPeersendFile(id: string): PeerSendFile | undefined {
	return getFileTransferState().files.find((f) => f.id === id);
}
