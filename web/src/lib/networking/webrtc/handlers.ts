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

import { appState, fileTransferState, getPeersendFile, isAppFeatureEnabled } from "@/state";
import {
	fileStorage,
	createCustomFileFromTransfer,
	parseTransitBuffer,
	ProgressThrottler,
	truncateFileName,
	getCurrentFileCapacity
} from "@/lib/file-transfer";
import { createLogger } from "@/utils/logger";
import { toast } from "sonner";
import { abortRegistry } from "@/lib/networking/core/abort-registry";

const log = createLogger("WebRtcEvents");

const throttler = new ProgressThrottler(1, 150);

export interface WebRTCHandlerContext {
	rtc: WebRTCClient;
}

export const messageHandlers: NetworkEvents<WebRTCIncomingMessage, WebRTCHandlerContext> = {
	start_file_transit(data: WebRTCDataStartFileTransit, ctx: WebRTCHandlerContext): void {
		if (getPeersendFile(data.id)) {
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
		fileTransferState.add([file]);
	},

	in_file_transit(data: WebRTCDataInFileTransit): void {
		// https://github.com/itsmichaelbtw/peersend.io/issues/37
		const parsed = parseTransitBuffer(data);
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
		const truncated = file ? truncateFileName(file.metadata.name) : "Unknown file";

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
		appState.dispatch("SET_LAST_ERROR", {
			title: data.type,
			message: data.reason
		});
	}
};
