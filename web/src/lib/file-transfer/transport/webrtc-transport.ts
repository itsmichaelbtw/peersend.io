import type { PeerSendFile } from "@/state";
import type { WebRtcClient } from "@/lib/networking";
import type { FileTransferTransport } from "../types";

import { fileTransferState } from "@/state";

import { BUFFER_THRESHOLD } from "../constants";

export class WebRtcTransport implements FileTransferTransport {
  private client: WebRtcClient;
  private datachannel: RTCDataChannel;

  constructor(client: WebRtcClient, datachannel: RTCDataChannel) {
    this.client = client;
    this.datachannel = datachannel;
  }

  private async wait(): Promise<void> {
    if (this.datachannel.bufferedAmount <= BUFFER_THRESHOLD) {
      return;
    }

    return new Promise((resolve) => {
      this.datachannel.bufferedAmountLowThreshold = BUFFER_THRESHOLD;

      const listener = () => {
        this.datachannel.removeEventListener("bufferedamountlow", listener);
        resolve();
      };

      this.datachannel.addEventListener("bufferedamountlow", listener);
    });
  }

  public async start(
    id: string,
    transferSize: number,
    metadata: PeerSendFile["metadata"]
  ): Promise<void> {
    this.client.emit({
      type: "start_file_transit",
      data: {
        id: id,
        transferSize: transferSize,
        metadata: metadata
      }
    });
  }

  public async error(id: string): Promise<void> {
    fileTransferState.dispatch("SET_FILE_STATUS", {
      id: id,
      status: "error"
    });
  }

  public async chunk(id: string, chunk: Uint8Array, percentage: number): Promise<void> {
    if (this.datachannel.bufferedAmount > BUFFER_THRESHOLD) {
      await this.wait();
    }

    this.client.emit({
      type: "in_file_transit",
      data: chunk
    });

    fileTransferState.dispatch("SET_FILE_PERCENTAGE", {
      id: id,
      percentage: percentage
    });
  }

  public async complete(id: string): Promise<void> {
    // set to complete status
    this.client.emit({
      type: "end_file_transit",
      data: {
        id: id
      }
    });

    fileTransferState.dispatch("SET_FILE_STATUS", {
      id: id,
      status: "sent"
    });
  }
}
