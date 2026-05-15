import type { PeerSendFile } from "@/state/types";
import type { FileTransferTransport } from "./types";

import { parse } from "uuid";

import { FileChunker } from "./file-chunker";
import { calculatePercentage, createBufferWithHeader } from "./utils";
import { ProgressThrottler } from "./progress-throttler";
import { sleep } from "@/utils/sleep";
import { createLogger } from "@/utils/logger";
import { abortRegistry } from "@/lib/networking/core/abort-registry";
import { toast } from "sonner";

const log = createLogger("FileStorage");

export class FileTransfer {
	private transport: FileTransferTransport;
	private files: PeerSendFile[];

	constructor(files: PeerSendFile[], transport: FileTransferTransport) {
		this.transport = transport;
		this.files = files;
	}

	public async transfer(file: PeerSendFile): Promise<boolean> {
		log.info(`Starting transfer of file ${file.metadata.name}`);

		if (!file.nativeFile) {
			await this.transport.error(
				file.id,
				`File ${file.metadata.name} has no native file associated with it`
			);
			return false;
		}

		let signal: AbortSignal | undefined;

		try {
			signal = abortRegistry.register(file.id);
		} catch {
			log.warn("No active abort registry session, transfer will not be abortable");
		}

		const fileChunker = new FileChunker(file.nativeFile);
		const throttler = new ProgressThrottler(1, 150);

		const asBytes = parse(file.id);
		const totalBytes = file.nativeFile.size;

		const now = performance.now();

		let bytesSent = 0;

		try {
			await this.transport.start(file.id, totalBytes, file.metadata);

			for await (const chunk of fileChunker.chunk(undefined, signal)) {
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
			return true;
		} catch (error) {
			const isAbort = error instanceof DOMException && error.name === "AbortError";
			const message = isAbort
				? "Connection lost"
				: error instanceof Error
					? error.message
					: "An unknown error occurred";

			// not notifiying user of abort errors as these
			// are handled when the datachannel is closed
			if (!isAbort) {
				toast.error(`Transfer failed: ${file.metadata.name}`, {
					description: message
				});
			}

			await this.transport.error(file.id, message);
			return false;
		} finally {
			abortRegistry.abort(file.id);
		}
	}

	public async send(): Promise<void> {
		// change this to concurrent in future
		// https://github.com/itsmichaelbtw/peersend.io/issues/15

		let successCount = 0;

		for (const file of this.files) {
			if (await this.transfer(file)) successCount++;
		}

		if (successCount > 0) {
			const label = successCount === 1 ? "file" : "files";
			toast.success("Transfer complete", {
				description: `${successCount} ${label} sent`
			});
		}
	}
}
