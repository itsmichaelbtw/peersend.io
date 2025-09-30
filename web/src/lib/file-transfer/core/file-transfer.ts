import type { PeerSendFile } from "@/state/types";
import type { FileTransferTransport } from "../types";

import { parse } from "uuid";

import { FileChunker } from "./file-chunker";
import { calculatePercentage, createBufferWithHeader } from "../utils";
import { ProgressThrottler } from "../progress-throttler";
import { sleep } from "@/utils/sleep";

export class FileTransfer {
  private transport: FileTransferTransport;
  private files: PeerSendFile[];

  constructor(files: PeerSendFile[], transport: FileTransferTransport) {
    this.transport = transport;
    this.files = files;
  }

  public async transfer(file: PeerSendFile): Promise<void> {
    if (!file.nativeFile) {
      return await this.transport.error(file.id);
    }

    const fileChunker = new FileChunker(file.nativeFile);
    const throttler = new ProgressThrottler(1, 150);

    const asBytes = parse(file.id);
    const totalBytes = file.nativeFile.size;

    const now = performance.now();

    let bytesSent = 0;

    try {
      await this.transport.start(file.id, totalBytes, file.metadata);

      for await (const chunk of fileChunker.chunk()) {
        let percentage = calculatePercentage(bytesSent + chunk.length, totalBytes);

        if (!throttler.canUpdate(percentage)) {
          percentage = -1;
        }

        await this.transport.chunk(file.id, createBufferWithHeader(asBytes, chunk), percentage);
        bytesSent += chunk.length;
      }

      if (performance.now() - now <= 500) {
        await sleep(500);
      }

      await this.transport.complete(file.id);
    } catch (error) {
      await this.transport.error(file.id);
    }
  }

  public async initiate(): Promise<void> {
    // change this to concurrent in future
    // https://github.com/itsmichaelbtw/peersend.io/issues/15

    for (const file of this.files) {
      await this.transfer(file);
    }
  }
}
