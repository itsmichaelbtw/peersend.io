import { test, expect } from "@playwright/test";
import type { FileWithPath } from "@mantine/dropzone";
import type { WebRTCDataStartFileTransit } from "@/lib/networking/webrtc/types";

import {
	createCustomFileFromUpload,
	createCustomFileFromTransfer,
	createBufferWithHeader,
	parseTransitBuffer,
	truncateFileName,
	formatFileSize,
	calculatePercentage
} from "@/lib/file-transfer/utils";
import { FILE_ID_BYTE_LENGTH } from "@/lib/file-transfer/constants";

function makeValidUuidBytes(): Uint8Array {
	return new Uint8Array([
		0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x4d, 0xef, 0x8a, 0xbc, 0xde, 0xf1, 0x23, 0x45, 0x67, 0x89
	]);
}

function makeFileWithPath(): FileWithPath {
	const file = new File(["hello"], "example.txt", { type: "text/plain", lastModified: 1_700_000_000_000 });
	return Object.assign(file, { path: "/tmp/example.txt" });
}

function makeTransferStart(): WebRTCDataStartFileTransit {
	return {
		id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
		transferSize: 5,
		metadata: {
			name: "received.bin",
			path: "",
			size: 5,
			type: "application/octet-stream",
			lastModified: 42
		}
	};
}

test.describe("file-transfer/utils", () => {
	test("createCustomFileFromUpload maps metadata and marks outgoing pending", () => {
		const uploaded = makeFileWithPath();
		const custom = createCustomFileFromUpload(uploaded);

		expect(custom.id).toMatch(/^[0-9a-f-]{36}$/);
		expect(custom.status).toBe("pending");
		expect(custom.transfer.type).toBe("outgoing");
		expect(custom.transfer.percentage).toBe(0);
		expect(custom.nativeFile).toBe(uploaded);
		expect(custom.metadata.name).toBe("example.txt");
		expect(custom.metadata.size).toBe(uploaded.size);
	});

	test("createCustomFileFromTransfer marks incoming in-transit and keeps transfer id", () => {
		const transfer = makeTransferStart();
		const custom = createCustomFileFromTransfer(transfer);

		expect(custom.id).toBe(transfer.id);
		expect(custom.status).toBe("in-transit");
		expect(custom.transfer.type).toBe("incoming");
		expect(custom.nativeFile).toBeNull();
		expect(custom.metadata).toEqual(transfer.metadata);
	});

	test("createBufferWithHeader + parseTransitBuffer round-trips chunk bytes", () => {
		const id = makeValidUuidBytes();
		const payload = new Uint8Array([1, 2, 3, 4, 5]);
		const framed = createBufferWithHeader(id, payload);
		const parsed = parseTransitBuffer(framed);

		expect(framed.length).toBe(FILE_ID_BYTE_LENGTH + payload.length);
		expect(parsed.fileId).toMatch(/^[0-9a-f]{8}-/);
		expect(Array.from(parsed.chunk)).toEqual([1, 2, 3, 4, 5]);
	});

	test("createBufferWithHeader throws when UUID header has invalid length", () => {
		expect(() => createBufferWithHeader(new Uint8Array(4), new Uint8Array([1]))).toThrow(
			"Invalid file id length"
		);
	});

	test("truncateFileName preserves extension and max length for long names", () => {
		const out = truncateFileName("this_is_a_really_really_really_long_file_name_for_transfer.pdf");
		expect(out.length).toBeLessThanOrEqual(35);
		expect(out.endsWith(".pdf")).toBe(true);
	});

	test("truncateFileName uses middle ellipsis for extensionless long names", () => {
		const out = truncateFileName("thisfilenamehasnoperiodandiswaytoolongtokeep");
		expect(out).toContain("…");
		expect(out.length).toBeLessThanOrEqual(35);
	});

	test("formatFileSize handles unit boundaries", () => {
		expect(formatFileSize(0)).toBe("0 B");
		expect(formatFileSize(1023)).toBe("1023 B");
		expect(formatFileSize(1024)).toBe("1 KB");
		expect(formatFileSize(1536, 1)).toBe("1.5 KB");
	});

	test("calculatePercentage handles zero-size edge cases without NaN", () => {
		expect(calculatePercentage(0, 0)).toBe(100);
		expect(calculatePercentage(5, 0)).toBe(0);
		expect(Number.isNaN(calculatePercentage(5, 0))).toBe(false);
	});
});
