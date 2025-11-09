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

import { appState, fileTransferState, getPeersendFile } from "@/state";
import {
	fileStorage,
	createCustomFileFromTransfer,
	parseTransitBuffer,
	ProgressThrottler
} from "@/lib/file-transfer";
import { getWebRTCClient } from "../utils";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebRtcEvents");

const throttler = new ProgressThrottler(1, 150);

function event_StartFileTransit(data: WebRTCDataStartFileTransit): void {
	if (getPeersendFile(data.id)) {
		log.error(`File with id ${data.id} already exists, ignoring incoming file transfer.`);
		return;
	}

	log.info(`Receiving file: ${data.metadata.name} (${data.transferSize} bytes)`);
	const file = createCustomFileFromTransfer(data);
	fileStorage.init(data.id, data.transferSize);
	fileTransferState.add([file]);
}

function event_InFileTransit(data: WebRTCDataInFileTransit): void {
	// https://github.com/itsmichaelbtw/peersend.io/issues/37

	const parsed = parseTransitBuffer(data);
	const progress = fileStorage.addChunk(parsed.fileId, parsed.chunk);

	if (throttler.canUpdate(progress)) {
		fileTransferState.dispatch("SET_FILE_PERCENTAGE", {
			id: parsed.fileId,
			percentage: progress
		});
	}
}

function event_EndFileTransit(data: WebRTCDataEndFileTransit): void {
	log.info(`Finished receiving file with id ${data.id}`);
	throttler.reset();

	if (fileStorage.isComplete(data.id)) {
		fileTransferState.dispatch("SET_FILE_STATUS", {
			id: data.id,
			status: "received"
		});
	} else {
		log.error(`File with id ${data.id} is incomplete, unable to finalize transfer.`);
		fileStorage.remove(data.id);
		fileTransferState.dispatch("SET_FILE_STATUS", {
			id: data.id,
			status: "error"
		});
	}
}

function event_Pong(data: WebRTCDataPong): void {
	getWebRTCClient().latencyChecker.pong(data);
}

function event_Ping(data: WebRTCDataPing): void {
	getWebRTCClient().emit({
		type: "pong",
		data: {
			client_timestamp: data.client_timestamp,
			server_timestamp: Date.now()
		}
	});
}

function event_Error(data: WebRTCDataError): void {
	appState.dispatch("SET_LAST_ERROR", {
		title: data.type,
		message: data.reason
	});
}

export const events: NetworkEvents<WebRTCIncomingMessage> = {
	start_file_transit: event_StartFileTransit,
	in_file_transit: event_InFileTransit,
	end_file_transit: event_EndFileTransit,
	pong: event_Pong,
	ping: event_Ping,
	error: event_Error
};
