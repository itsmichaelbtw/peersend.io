import type { PeerSendFile } from "@/state";
import type { WebRTCClient } from "@/lib/networking";
import type { FileTransferTransport } from "../types";

import { BUFFER_THRESHOLD } from "../constants";
import { fileTransferState } from "@/state";
import { createLogger } from "@/utils/logger";
import { abortRegistry } from "@/lib/networking/core/abort-registry";

const log = createLogger("WebRtcTransport");

export class WebRTCTransport implements FileTransferTransport {
	private client: WebRTCClient;
	private datachannel: RTCDataChannel;

	constructor(client: WebRTCClient, datachannel: RTCDataChannel) {
		this.client = client;
		this.datachannel = datachannel;
	}

	private async wait(id: string): Promise<void> {
		if (this.datachannel.bufferedAmount <= BUFFER_THRESHOLD) {
			return;
		}

		const signal = abortRegistry.getSignal(id);

		return new Promise((resolve, reject) => {
			this.datachannel.bufferedAmountLowThreshold = BUFFER_THRESHOLD;

			const onLow = (): void => {
				signal?.removeEventListener("abort", onAbort);
				this.datachannel.removeEventListener("bufferedamountlow", onLow);
				resolve();
			};

			const onAbort = (): void => {
				this.datachannel.removeEventListener("bufferedamountlow", onLow);
				reject(new DOMException("Transfer aborted", "AbortError"));
			};

			this.datachannel.addEventListener("bufferedamountlow", onLow);
			signal?.addEventListener("abort", onAbort, { once: true });
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

		return Promise.resolve();
	}

	public async chunk(id: string, chunk: Uint8Array, percentage: number): Promise<void> {
		if (this.datachannel.bufferedAmount > BUFFER_THRESHOLD) {
			log.warn("Data channel buffer exceeded threshold, waiting...");
			await this.wait(id);
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

		return Promise.resolve();
	}

	public async error(id: string, message: string): Promise<void> {
		log.error(`Error during file ${id} transfer: ${message}`);

		fileTransferState.dispatch("SET_FILE_STATUS", {
			id: id,
			status: "error",
			errorMessage: message
		});

		return Promise.resolve();
	}
}
