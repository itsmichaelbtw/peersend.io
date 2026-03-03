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
import { getWebRTCClient } from "../client-registry";
import { createLogger } from "@/utils/logger";

const log = createLogger("WebRtcEvents");

const throttler = new ProgressThrottler(1, 150);

function handleStartFileTransit(data: WebRTCDataStartFileTransit): void {
	if (getPeersendFile(data.id)) {
		log.error(`File with id ${data.id} already exists, ignoring incoming file transfer.`);
		return;
	}

	log.info(`Receiving file: ${data.metadata.name} (${data.transferSize} bytes)`);
	const file = createCustomFileFromTransfer(data);
	fileStorage.init(data.id, data.transferSize);
	fileTransferState.add([file]);
}

function handleInFileTransit(data: WebRTCDataInFileTransit): void {
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

function handleEndFileTransit(data: WebRTCDataEndFileTransit): void {
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

function handlePong(data: WebRTCDataPong): void {
	const rtc = getWebRTCClient();
	rtc.latencyChecker.pong(data);
}

function handlePing(data: WebRTCDataPing): void {
	const rtc = getWebRTCClient();
	rtc.emit({
		type: "pong",
		data: {
			client_timestamp: data.client_timestamp,
			server_timestamp: Date.now()
		}
	});
}

function handleError(data: WebRTCDataError): void {
	log.error("WebRTC received an error");
	appState.dispatch("SET_LAST_ERROR", {
		title: data.type,
		message: data.reason
	});
}

export const messageHandlers: NetworkEvents<WebRTCIncomingMessage> = {
	start_file_transit: handleStartFileTransit,
	in_file_transit: handleInFileTransit,
	end_file_transit: handleEndFileTransit,
	pong: handlePong,
	ping: handlePing,
	error: handleError
};

