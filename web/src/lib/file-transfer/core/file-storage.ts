import type { PeerSendFile } from "@/state";
import type { FileStorageRecord } from "../types";

import { calculatePercentage } from "../utils";

export class FileStorage {
	private files = new Map<string, FileStorageRecord>();

	public init(id: string, size: number): void {
		if (this.files.has(id)) {
			return;
		}

		this.files.set(id, {
			chunks: [],
			received: 0,
			size: size,
			complete: false
		});
	}

	public addChunk(id: string, chunk: Uint8Array): number {
		const file = this.files.get(id);

		if (!file) {
			throw new Error(`File ${id} not initialized`);
		}

		file.chunks.push(chunk);
		file.received += chunk.byteLength;

		return this.getProgress(id);
	}

	public getProgress(id: string): number {
		const file = this.files.get(id);

		if (!file) {
			return 0;
		}

		return calculatePercentage(file.received, file.size);
	}

	public isComplete(id: string): boolean {
		const file = this.files.get(id);

		if (!file) {
			return false;
		}

		const isComplete = file.received >= file.size;

		if (isComplete) {
			this.markComplete(id);
		}

		return isComplete;
	}

	public markComplete(id: string, clearMemory = false) {
		const file = this.files.get(id);

		if (!file) {
			return;
		}

		file.complete = true;

		if (clearMemory) {
			file.chunks = [];
		}
	}

	public getNativeFile(id: string, metadata: PeerSendFile["metadata"]): File {
		const file = this.files.get(id);

		if (!file) {
			throw new Error(`File ${id} not initialized`);
		}

		if (!this.isComplete(id)) {
			throw new Error(`File ${id} is not complete`);
		}

		const blob = new Blob(file.chunks as Uint8Array<ArrayBuffer>[], { type: metadata.type });

		return new File([blob], metadata.name, {
			type: metadata.type,
			lastModified: metadata.lastModified
		});
	}

	public getChunks(id: string): Uint8Array[] | undefined {
		return this.files.get(id)?.chunks;
	}

	public remove(id: string) {
		this.files.delete(id);
	}

	/** Clear all records */
	public reset() {
		this.files.clear();
	}

	public has(id: string): boolean {
		return this.files.has(id);
	}
}

export const fileStorage = new FileStorage();
