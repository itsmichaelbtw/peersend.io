import type { PeerSendFile } from "@/state/types";
import type { FileWithPath } from "@mantine/dropzone";

import { v4 } from "uuid";

export async function createCustomFile(
  file: FileWithPath,
  type: PeerSendFile["transfer"]["type"]
): Promise<PeerSendFile> {
  const id = v4();
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  return {
    id: id,
    timestamp: Date.now(),
    status: "pending",
    transfer: {
      type: type,
      percentage: 0
    },
    metadata: {
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      bytes: bytes
    }
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
