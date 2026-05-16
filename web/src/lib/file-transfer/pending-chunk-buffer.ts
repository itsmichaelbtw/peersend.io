import { createLogger } from "@/utils/logger";

const log = createLogger("PendingChunkBuffer");

const TTL_MS = 30_000;

export class PendingChunkBuffer {
	private chunks = new Map<string, Uint8Array[]>();
	private timers = new Map<string, ReturnType<typeof setTimeout>>();

	public buffer(fileId: string, chunk: Uint8Array): void {
		if (!this.chunks.has(fileId)) {
			this.chunks.set(fileId, []);
			this.timers.set(
				fileId,
				setTimeout(() => {
					log.warn(`Pending chunks for file ${fileId} expired after ${TTL_MS}ms, discarding`);
					this.clear(fileId);
				}, TTL_MS)
			);
		}

		this.chunks.get(fileId)!.push(chunk);
		log.debug(`Buffered pending chunk for file ${fileId} (total: ${this.chunks.get(fileId)!.length})`);
	}

	public drain(fileId: string): Uint8Array[] {
		const pending = this.chunks.get(fileId) ?? [];
		this.clear(fileId);
		return pending;
	}

	public has(fileId: string): boolean {
		return this.chunks.has(fileId);
	}

	public clear(fileId: string): void {
		const timer = this.timers.get(fileId);
		if (timer !== undefined) {
			clearTimeout(timer);
			this.timers.delete(fileId);
		}
		this.chunks.delete(fileId);
	}
}

export const pendingChunkBuffer = new PendingChunkBuffer();
