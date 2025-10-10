import type { PeerSendFile } from "@/state/types";
import type { FileWithPath } from "@mantine/dropzone";
import type { WebRtcEventMap } from "../networking";

import { v4, stringify } from "uuid";

import { FILE_ID_BYTE_LENGTH, DOWNLOAD_CONTAINER_ID } from "./constants";
import { fileStorage } from "./core";
import { getContainerElementForDownload } from "@/utils/dom";

export async function createCustomFileFromUpload(file: FileWithPath): Promise<PeerSendFile> {
	return {
		id: v4(),
		timestamp: Date.now(),
		status: "pending",
		transfer: {
			type: "outgoing",
			percentage: 0
		},
		metadata: {
			name: file.name,
			path: file.path,
			size: file.size,
			type: file.type,
			lastModified: file.lastModified
		},
		nativeFile: file
	};
}

export function createCustomFileFromTransfer(
	transfer: WebRtcEventMap.IncomingEvents["start_file_transit"]
): PeerSendFile {
	return {
		id: transfer.id,
		transfer: {
			type: "incoming",
			percentage: 0
		},
		timestamp: Date.now(),
		status: "in-transit",
		metadata: transfer.metadata,
		nativeFile: null
	};
}

export function createBufferWithHeader(id: Uint8Array, data: Uint8Array): Uint8Array {
	if (id.length != FILE_ID_BYTE_LENGTH) {
		throw new Error(`Invalid file id length: expected ${FILE_ID_BYTE_LENGTH}, got ${id.length}`);
	}

	const buffer = new Uint8Array(FILE_ID_BYTE_LENGTH + data.length);

	buffer.set(id, 0);
	buffer.set(data, FILE_ID_BYTE_LENGTH);

	return buffer;
}

export function parseTransitBuffer(buffer: Uint8Array) {
	const id = buffer.slice(0, FILE_ID_BYTE_LENGTH);
	const chunk = buffer.slice(FILE_ID_BYTE_LENGTH);

	return {
		fileId: stringify(id),
		chunk: chunk
	};
}

export function truncateFileName(filename: string): string {
	const maxLength = 35;

	if (filename.length <= maxLength) {
		return filename;
	}

	const lastDotIndex = filename.lastIndexOf(".");

	if (lastDotIndex === -1 || lastDotIndex === 0) {
		const half = Math.floor((maxLength - 1) / 2);
		return filename.slice(0, half) + "…" + filename.slice(-half);
	}

	const name = filename.slice(0, lastDotIndex);
	const extension = filename.slice(lastDotIndex);

	const availableLength = maxLength - extension.length - 1;
	const front = Math.ceil(availableLength / 2);
	const back = Math.floor(availableLength / 2);

	return name.slice(0, front) + "..." + name.slice(-back) + extension;
}

export function formatFileSize(bytes: number, decimals = 2): string {
	if (bytes === 0) {
		return "0 B";
	}

	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
	return `${value} ${sizes[i]}`;
}

export function calculatePercentage(a: number, b: number): number {
	return Math.round((a / b) * 100);
}

export function triggerBrowserDownload(file: File): void {
	const container = getContainerElementForDownload(DOWNLOAD_CONTAINER_ID);

	const url = URL.createObjectURL(file);
	const element = document.createElement("a");

	element.href = url;
	element.download = file.name;

	container.appendChild(element);

	try {
		element.click();
	} finally {
		container.removeChild(element);
		URL.revokeObjectURL(url);
	}
}
export async function smartFileDownload(files: PeerSendFile[]): Promise<void> {
	for (const file of files) {
		try {
			const nativeFile = fileStorage.getNativeFile(file.id, file.metadata);

			// zip or combine or do other things here
			// https://github.com/itsmichaelbtw/peersend.io/issues/39

			triggerBrowserDownload(nativeFile);
		} catch (error) {
			console.error(error);
		}
	}
}
