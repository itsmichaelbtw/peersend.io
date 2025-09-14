import type { FileWithPath } from "@mantine/dropzone";
import type { ContextReducerActions, InitialStateWithDispatch } from "../context.types";

type FileTransferType = "incoming" | "outgoing";

interface FilesAsArray {
  files: PeerSendFile[];
}

export interface FileTransferReducerMap {
  ADD_FILES: FilesAsArray;
  REMOVE_FILES: FilesAsArray;
}

export type FileTransferReducerTypes = keyof FileTransferReducerMap;

export interface PeerSendFile<T extends FileTransferType = FileTransferType> {
  id: string;
  timestamp: number;
  status: "pending" | "in-transit" | "sent" | "error";
  transferType: T;
  file: FileWithPath;
}

export interface FileTransferInterface {
  files: PeerSendFile[];
}

export interface FileTransferMethods {
  /** A cached method for getting all `incoming` files */
  getIncomingFiles(): PeerSendFile<"incoming">[];
  /** A cached method for getting all `outgoing` files */
  getOutgoingFiles(): PeerSendFile<"outgoing">[];
}

export type FileTransferReducerActions = ContextReducerActions<
  FileTransferReducerMap,
  FileTransferInterface
>;

export type InitialFileTransferContext = InitialStateWithDispatch<
  FileTransferReducerMap,
  FileTransferInterface,
  "fileTransferDispatch"
> &
  FileTransferMethods;
