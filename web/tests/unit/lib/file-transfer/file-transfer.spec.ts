import { test, expect } from "@playwright/test";
import type { PeerSendFile } from "@/state/types";
import type { FileTransferTransport } from "@/lib/file-transfer/types";

import { FileTransfer } from "@/lib/file-transfer/file-transfer";

class MockTransport implements FileTransferTransport {
	public starts: string[] = [];
	public chunks: Array<{ id: string; chunk: Uint8Array; percentage: number }> = [];
	public completes: string[] = [];
	public errors: Array<{ id: string; message: string }> = [];
	public failOnChunk = false;

	public start(id: string): Promise<void> {
		this.starts.push(id);
		return Promise.resolve();
	}

	public chunk(id: string, chunk: Uint8Array, percentage: number): Promise<void> {
		this.chunks.push({ id, chunk, percentage });
		if (this.failOnChunk) {
			return Promise.reject(new Error("chunk failed"));
		}
		return Promise.resolve();
	}

	public error(id: string, message: string): Promise<void> {
		this.errors.push({ id, message });
		return Promise.resolve();
	}

	public complete(id: string): Promise<void> {
		this.completes.push(id);
		return Promise.resolve();
	}
}

function makePeerFile(id: string, content: string, includeNative = true): PeerSendFile<"outgoing"> {
	const file = includeNative
		? Object.assign(new File([content], "sample.txt", { type: "text/plain" }), { path: "" })
		: null;

	return {
		id,
		timestamp: Date.now(),
		status: "pending",
		transfer: { type: "outgoing", percentage: 0 },
		metadata: {
			name: "sample.txt",
			path: "",
			size: content.length,
			type: "text/plain",
			lastModified: 1
		},
		nativeFile: file
	};
}

test.describe("FileTransfer", () => {
	test("transfer reports error when native file is missing", async () => {
		const transport = new MockTransport();
		const transfer = new FileTransfer([], transport);
		const file = makePeerFile("3fa85f64-5717-4562-b3fc-2c963f66afa6", "abc", false);

		await transfer.transfer(file);

		expect(transport.starts).toEqual([]);
		expect(transport.errors[0]?.id).toBe(file.id);
		expect(transport.errors[0]?.message).toContain("has no native file");
	});

	test("transfer sends start, framed chunks, and complete", async () => {
		const transport = new MockTransport();
		const transfer = new FileTransfer([], transport);
		const file = makePeerFile("3fa85f64-5717-4562-b3fc-2c963f66afa6", "hello");

		await transfer.transfer(file);

		expect(transport.starts).toEqual([file.id]);
		expect(transport.completes).toEqual([file.id]);
		expect(transport.errors).toEqual([]);
		expect(transport.chunks.length).toBeGreaterThan(0);
		expect(transport.chunks[0]?.chunk.length).toBeGreaterThan(file.metadata.size);
	});

	test("transfer catches transport chunk failures and reports error", async () => {
		const transport = new MockTransport();
		transport.failOnChunk = true;
		const transfer = new FileTransfer([], transport);
		const file = makePeerFile("3fa85f64-5717-4562-b3fc-2c963f66afa6", "hello");

		await transfer.transfer(file);

		expect(transport.starts).toEqual([file.id]);
		expect(transport.completes).toEqual([]);
		expect(transport.errors[0]?.message).toBe("chunk failed");
	});

	test("send processes files sequentially in provided order", async () => {
		const transport = new MockTransport();
		const files = [
			makePeerFile("3fa85f64-5717-4562-b3fc-2c963f66afa6", "one"),
			makePeerFile("9af08f95-9f98-49ac-8104-7f24584fa1f6", "two")
		];
		const sender = new FileTransfer(files, transport);

		await sender.send();

		expect(transport.starts).toEqual([files[0].id, files[1].id]);
		expect(transport.completes).toEqual([files[0].id, files[1].id]);
	});
});
