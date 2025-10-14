import { DEFAULT_CHUNK_SIZE } from "../constants";
import { createLogger } from "@/utils/logger";

const log = createLogger("FileChunker");

export class FileChunker {
	private file: File;

	constructor(file: File) {
		this.file = file;
	}

	async *chunk(chunkSize: number = DEFAULT_CHUNK_SIZE): AsyncGenerator<Uint8Array, void> {
		log.info(`Starting chunk on file ${this.file.name}`);

		let offset = 0;

		while (offset < this.file.size) {
			const end = Math.min(offset + chunkSize, this.file.size);
			const blob = this.file.slice(offset, end);
			const buffer = await blob.arrayBuffer();
			yield new Uint8Array(buffer);
			offset = end;
		}

		log.info(`Finished chunking file ${this.file.name}`);
	}
}
