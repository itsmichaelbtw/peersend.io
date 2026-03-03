import type { PeerSendFile } from "@/state/types";
import type { FileTransferTransport } from "./types";

import { parse } from "uuid";

import { FileChunker } from "./file-chunker";
import { calculatePercentage, createBufferWithHeader } from "./utils";
import { ProgressThrottler } from "./progress-throttler";
import { sleep } from "@/utils/sleep";
import { createLogger } from "@/utils/logger";

const log = createLogger("FileStorage");

export class FileTransfer {
	private transport: FileTransferTransport;
	private files: PeerSendFile[];

	constructor(files: PeerSendFile[], transport: FileTransferTransport) {
		this.transport = transport;
		this.files = files;
	}

	public async transfer(file: PeerSendFile): Promise<void> {
		log.info(`Starting transfer of file ${file.metadata.name}`);

		if (!file.nativeFile) {
			return await this.transport.error(
				file.id,
				`File ${file.metadata.name} has no native file associated with it`
			);
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
				log.warn("File transferred too quickly, adding artificial delay to improve UX");
				await sleep(500);
			}

			log.success(`File transfer has been completed for ${file.metadata.name}`);
			await this.transport.complete(file.id);
		} catch (error) {
			const message = error instanceof Error ? error.message : "An unknown error occurred";
			await this.transport.error(file.id, message);
		}
	}

	public async send(): Promise<void> {
		// change this to concurrent in future
		// https://github.com/itsmichaelbtw/peersend.io/issues/15

		for (const file of this.files) {
			await this.transfer(file);
		}
	}
}
