import type { FileType } from "../types";

import { DEFAULT_CHUNK_SIZE } from "../constants";

export class FileChunker {
  private file: FileType;

  constructor(file: FileType) {
    this.file = file;
  }

  async *chunk(chunkSize: number = DEFAULT_CHUNK_SIZE): AsyncGenerator<Uint8Array, void> {
    let buffer: ArrayBuffer;

    switch (true) {
      case this.file instanceof File:
        buffer = await this.file.arrayBuffer();
        break;
      case this.file instanceof Uint8Array:
        buffer = this.file.buffer as ArrayBuffer;
        break;
      default:
        buffer = this.file;
    }

    let offset = 0;
    let index = 0;

    while (offset < buffer.byteLength) {
      const end = Math.min(offset + chunkSize, buffer.byteLength);
      const slice = buffer.slice(offset, end);
      const chunk = new Uint8Array(slice);

      yield chunk;

      offset = end;
      index++;
    }
  }
}
