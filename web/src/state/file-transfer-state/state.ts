import type { FileTransferState, PeerSendFile } from "../types";

import { FileTransferStore } from "./store";
import { createStateStore } from "../store";

type FileUpdater = (file: PeerSendFile) => Omit<Partial<PeerSendFile>, "id">;

const initialState: FileTransferState = {
  files: []
};

export const fileTransferState = createStateStore(FileTransferStore, initialState);

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

export function mergeFileUpdates(files: PeerSendFile[], getUpdate: FileUpdater): PeerSendFile[] {
  const current = fileTransferState.get();
  const fileMap = new Map(current.files.map((f) => [f.id, f]));

  for (const file of files) {
    const update = getUpdate(file);
    if (!file.id) {
      continue;
    }

    const existing = fileMap.get(file.id);
    if (existing) {
      fileMap.set(file.id, { ...existing, ...update });
    }
  }

  return Array.from(fileMap.values());
}
