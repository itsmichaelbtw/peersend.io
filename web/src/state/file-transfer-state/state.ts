import type { FileTransferState, PeerSendFile } from "../types";

import { FileTransferStore } from "./store";

const initialState: FileTransferState = {
  files: []
};

export const fileTransferState = new FileTransferStore(initialState);

export function getFileTransferState() {
  return fileTransferState.get();
}

export function getIncomingFiles() {
  const { files } = fileTransferState.get();

  return files.filter((f): f is PeerSendFile<"incoming"> => f.transfer.type === "incoming");
}

export function getOutgoingFiles() {
  const { files } = fileTransferState.get();

  return files.filter((f): f is PeerSendFile<"incoming"> => f.transfer.type === "outgoing");
}

export function getPeersendFile(id: string): PeerSendFile | undefined {
  return getFileTransferState().files.find((f) => f.id === id);
}
