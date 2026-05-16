import type {
	WebRTCDataStartFileTransit,
	WebRTCDataInFileTransit,
	WebRTCDataEndFileTransit,
	WebRTCDataRejectFileTransit,
	WebRTCDataPong,
	WebRTCDataPing,
	WebRTCDataError,
	WebRTCIncomingMessage
} from "./types";
import type { NetworkEvents } from "../types";
import type { WebRTCClient } from "./client";

import { appState, fileTransferState, getPeersendFile, hasPeersendFile, isAppFeatureEnabled } from "@/state";
import {
	fileStorage,
	pendingChunkBuffer,
	createCustomFileFromTransfer,
	parseTransitBuffer,
	ProgressThrottler,
	truncateFileName,
	getCurrentFileCapacity
} from "@/lib/file-transfer";
import { createLogger } from "@/utils/logger";
import { toast } from "sonner";
import { capitalise } from "@/utils/capitalise";
import { abortRegistry } from "@/lib/networking/core/abort-registry";

const log = createLogger("WebRtcEvents");

const throttler = new ProgressThrottler(1, 150);

export interface WebRTCHandlerContext {
	rtc: WebRTCClient;
}

export const messageHandlers: NetworkEvents<WebRTCIncomingMessage, WebRTCHandlerContext> = {
	start_file_transit(data: WebRTCDataStartFileTransit, ctx: WebRTCHandlerContext): void {
		if (hasPeersendFile(data.id)) {
			log.error(`File with id ${data.id} already exists, ignoring incoming file transfer.`);
			return;
		}

		const file = createCustomFileFromTransfer(data);

		if (isAppFeatureEnabled("file_transfer_capacity")) {
			const { sessionState } = appState.get();
			const { files } = fileTransferState.get();
			const incomingFiles = files.filter((f) => f.transfer.type === "incoming");
			const currentBytes = getCurrentFileCapacity(incomingFiles);

			if (currentBytes >= sessionState.fileTransferCapacity) {
				log.warn(`Rejecting file ${data.id}: exceeds transfer capacity`);

				toast.error("File rejected", {
					description: `${truncateFileName(data.metadata.name)} exceeds the transfer capacity`
				});

				ctx.rtc.emit({
					type: "reject_file_transit",
					data: { id: data.id, reason: "Transfer capacity exceeded" }
				});

				return;
			}
		}

		log.info(`Receiving file: ${data.metadata.name} (${data.transferSize} bytes)`);
		fileStorage.init(data.id, data.transferSize);

		if (pendingChunkBuffer.has(data.id)) {
			const buffered = pendingChunkBuffer.drain(data.id);
			log.warn(`Draining ${buffered.length} buffered chunk(s) for file ${data.id}`);
			for (const chunk of buffered) {
				fileStorage.addChunk(data.id, chunk);
			}
		}

		fileTransferState.add([file]);
	},

	in_file_transit(data: WebRTCDataInFileTransit): void {
		const parsed = parseTransitBuffer(data);

		if (!fileStorage.has(parsed.fileId) || !hasPeersendFile(parsed.fileId)) {
			log.warn(`Chunk received for unknown file ${parsed.fileId}, buffering`);
			pendingChunkBuffer.buffer(parsed.fileId, parsed.chunk);
			return;
		}

		const progress = fileStorage.addChunk(parsed.fileId, parsed.chunk);

		if (throttler.canUpdate(progress)) {
			fileTransferState.dispatch("SET_FILE_PERCENTAGE", {
				id: parsed.fileId,
				percentage: progress
			});
		}
	},

	end_file_transit(data: WebRTCDataEndFileTransit): void {
		log.info(`Finished receiving file with id ${data.id}`);
		throttler.reset();

		const file = getPeersendFile(data.id);

		if (!file) {
			log.warn(`end_file_transit received for unknown file ${data.id}, ignoring`);
			pendingChunkBuffer.clear(data.id);
			return;
		}

		const truncated = truncateFileName(file.metadata.name);

		if (fileStorage.isComplete(data.id)) {
			fileTransferState.dispatch("SET_FILE_STATUS", {
				id: data.id,
				status: "received"
			});

			toast.success("File received", {
				description: truncated
			});

			return;
		}

		log.error(`File with id ${data.id} is incomplete, unable to finalize transfer.`);
		fileStorage.remove(data.id);
		fileTransferState.dispatch("SET_FILE_STATUS", {
			id: data.id,
			status: "error",
			errorMessage: "Transfer was incomplete"
		});

		toast.error("File transfer failed", {
			description: truncated
		});
	},

	reject_file_transit(data: WebRTCDataRejectFileTransit): void {
		log.warn(`File ${data.id} was rejected by the receiver: ${data.reason}`);

		pendingChunkBuffer.clear(data.id);

		fileTransferState.dispatch("SET_FILE_STATUS", {
			id: data.id,
			status: "error",
			errorMessage: data.reason
		});

		abortRegistry.abort(data.id);

		const file = getPeersendFile(data.id);
		toast.error("Transfer rejected", {
			description: file ? truncateFileName(file.metadata.name) : "Unknown file"
		});
	},

	pong(data: WebRTCDataPong, ctx: WebRTCHandlerContext): void {
		ctx.rtc.pong(data);
	},

	ping(data: WebRTCDataPing, ctx: WebRTCHandlerContext): void {
		ctx.rtc.emit({
			type: "pong",
			data: {
				client_timestamp: data.client_timestamp,
				server_timestamp: Date.now()
			}
		});
	},

	error(data: WebRTCDataError): void {
		log.error("WebRTC received an error");
		appState.dispatch("RESET_CONNECTING_STATES", null);
		toast.error(data.type, {
			id: data.type,
			description: capitalise(data.reason)
		});
	}
};
