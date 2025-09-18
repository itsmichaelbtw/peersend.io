import type { PeerSendFile } from "@/state/types";

import { parse, v4 } from "uuid";

import { FileChunker } from "./file-chunker";
import { fileBytesStore } from "./file-store";

import { webrtcClient } from "@/lib/networking";
import { appState, fileTransferState } from "@/state";
import { sleep } from "@/utils/sleep";
import { noop } from "@/utils/noop";

type FileTransferStatus = "complete" | "error";
type FileTransferProgress = (percentage: number) => void;

interface FileTransferIdentifier {
  asString: string;
  asBytes: Uint8Array;
}

const BUFFER_THRESHOLD = 1024 ** 2;

export function generateFileTransferIdentifier(): FileTransferIdentifier {
  const id = v4();
  const bytes = parse(id);

  return {
    asString: id,
    asBytes: bytes
  };
}

export function bufferWithHeader(id: Uint8Array, data: Uint8Array): Uint8Array {
  const offset = id.length + data.length;
  const buffer = new Uint8Array(offset);

  buffer.set(id, 0);
  buffer.set(data, id.length);

  return buffer;
}

export async function transferFileOverNetwork(
  file: PeerSendFile,
  onProgress: FileTransferProgress = noop
): Promise<FileTransferStatus> {
  try {
    const fileBytes = fileBytesStore.get(file.id);

    if (!fileBytes) {
      console.error("no bytes exist");
      return "error";
    }

    const fileChunker = new FileChunker(fileBytes);
    const transferIdentifier = generateFileTransferIdentifier();
    const totalBytes = fileBytes.length;

    const { webrtcState } = appState.get();

    webrtcClient.emit({
      type: "start_file_transit",
      data: {
        id: transferIdentifier.asString,
        ...file.metadata
      }
    });

    let bytesSent = 0;

    for await (const chunk of fileChunker.chunk()) {
      do {
        await sleep(50);
      } while (webrtcState.dataChannel!._channel.bufferedAmount > BUFFER_THRESHOLD);

      webrtcClient.emit({
        type: "in_file_transit",
        data: bufferWithHeader(transferIdentifier.asBytes, chunk.bytes)
      });

      bytesSent += chunk.bytes.length;

      const percentage = Math.round((bytesSent / totalBytes) * 100);
      onProgress(percentage);
    }

    webrtcClient.emit({
      type: "end_file_transit",
      data: {
        id: transferIdentifier.asString
      }
    });

    return "complete";
  } catch (error) {
    console.error(error);

    return "error";
  }
}

export async function initiateFileTransfer(files: PeerSendFile[]) {
  fileTransferState.dispatch(
    "BULK_UPDATE_FILES",
    files.map((file) => {
      return {
        ...file,
        status: "in-transit"
      };
    })
  );

  await sleep(500);

  for (const file of files) {
    const status = await transferFileOverNetwork(file, (percentage) => {
      fileTransferState.dispatch("SET_FILE_PERCENTAGE", {
        id: file.id,
        percentage: percentage
      });
    });

    fileTransferState.dispatch("SET_FILE_STATUS", {
      id: file.id,
      status: status === "complete" ? "sent" : "error"
    });
  }

  // https://github.com/itsmichaelbtw/peersend.io/issues/15
}
