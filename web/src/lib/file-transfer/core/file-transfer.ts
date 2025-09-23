import type { PeerSendFile } from "@/state/types";
import type { FileTransferTransport } from "../types";

import { FileChunker } from "./file-chunker";
import { fileBytesStore } from "./file-store";
import { createBufferWithHeader, createFileTransferIdentifier } from "../utils";

export class FileTransfer {
  private transport: FileTransferTransport;
  private files: PeerSendFile[];

  constructor(files: PeerSendFile[], transport: FileTransferTransport) {
    this.transport = transport;
    this.files = files;
  }

  public async transfer(file: PeerSendFile): Promise<void> {
    const fileBytes = fileBytesStore.get(file.id);

    if (!fileBytes) {
      await this.transport.error(file.id);
      return;
    }

    const id = createFileTransferIdentifier();
    const fileChunker = new FileChunker(fileBytes);
    const totalBytes = fileBytes.length;

    let bytesSent = 0;

    try {
      await this.transport.start(id.asString, totalBytes, file.metadata);

      for await (const chunk of fileChunker.chunk()) {
        const payload = createBufferWithHeader(id.asBytes, chunk);
        const percentage = Math.round(((bytesSent + chunk.length) / totalBytes) * 100);

        await this.transport.chunk(id.asString, payload, percentage);

        bytesSent += chunk.length;
      }

      await this.transport.complete(id.asString);
    } catch (error) {
      await this.transport.error(id.asString);
    }
  }

  public async initiate(): Promise<void> {
    // change this to concurrent in future

    for (const file of this.files) {
      await this.transfer(file);
    }
  }
}
