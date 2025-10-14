import type { PeerSendFile } from "@/state";
import type { WebRtcClient } from "@/lib/networking";
import type { FileTransferTransport } from "../types";

import { BUFFER_THRESHOLD } from "../constants";
import { fileTransferState } from "@/state";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebRtcTransport");

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
				log.warn("Data channel buffered amount is low");
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

	public async chunk(id: string, chunk: Uint8Array, percentage: number): Promise<void> {
		if (this.datachannel.bufferedAmount > BUFFER_THRESHOLD) {
			log.warn("Data channel buffer exceeded threshold, waiting...");
			await this.wait();
		}

		this.client.emit({
			type: "in_file_transit",
			data: chunk
		});

		if (percentage > 0) {
			fileTransferState.dispatch("SET_FILE_PERCENTAGE", {
				id: id,
				percentage: percentage
			});
		}
	}

	public async complete(id: string): Promise<void> {
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

	public async error(id: string, message: string): Promise<void> {
		log.error(`Error during file ${id} transfer: ${message}`);

		fileTransferState.dispatch("SET_FILE_STATUS", {
			id: id,
			status: "error"
		});
	}
}
