import type {
	WebRTCDataStartFileTransit,
	WebRTCDataInFileTransit,
	WebRTCDataEndFileTransit,
	WebRTCDataPong,
	WebRTCDataPing,
	WebRTCDataError,
	WebRTCIncomingMessage
} from "./types";
import type { NetworkEvents } from "../types";
import type { WebRTCClient } from "./client";

import { appState, fileTransferState, getPeersendFile } from "@/state";
import {
	fileStorage,
	createCustomFileFromTransfer,
	parseTransitBuffer,
	ProgressThrottler
} from "@/lib/file-transfer";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebRtcEvents");

const throttler = new ProgressThrottler(1, 150);

export interface WebRTCHandlerContext {
	rtc: WebRTCClient;
}

export const messageHandlers: NetworkEvents<WebRTCIncomingMessage, WebRTCHandlerContext> = {
	start_file_transit(data: WebRTCDataStartFileTransit): void {
		if (getPeersendFile(data.id)) {
			log.error(`File with id ${data.id} already exists, ignoring incoming file transfer.`);
			return;
		}

		log.info(`Receiving file: ${data.metadata.name} (${data.transferSize} bytes)`);
		const file = createCustomFileFromTransfer(data);
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

		if (fileStorage.isComplete(data.id)) {
			fileTransferState.dispatch("SET_FILE_STATUS", {
				id: data.id,
				status: "received"
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
