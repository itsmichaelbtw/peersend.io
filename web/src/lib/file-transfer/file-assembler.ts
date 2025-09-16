interface FileState {
  chunks: Uint8Array[];
  totalSize: number;
  totalChunks: number;
}

export class FileAssembler {
  private files = new Map<string, FileState>();

  initFile(fileId: string, totalSize: number, totalChunks: number) {
    if (!this.files.has(fileId)) {
      this.files.set(fileId, {
        chunks: new Array(totalChunks),
        totalSize,
        totalChunks
      });
    }
  }

  addChunk(fileId: string, index: number, chunk: Uint8Array) {
    const file = this.files.get(fileId);
    if (!file) throw new Error(`File ${fileId} not initialized`);
    file.chunks[index] = chunk;
  }

  isComplete(fileId: string): boolean {
    const file = this.files.get(fileId);
    if (!file) return false;
    return file.chunks.length === file.totalChunks && file.chunks.every(Boolean);
  }

  reconstruct(fileId: string): Uint8Array {
    const file = this.files.get(fileId);
    if (!file || !this.isComplete(fileId)) {
      throw new Error(`Cannot reconstruct file ${fileId}`);
    }

    const result = new Uint8Array(file.totalSize);
    let offset = 0;

    for (const chunk of file.chunks) {
      result.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return result;
  }

  reset(fileId: string) {
    this.files.delete(fileId);
  }

  resetAll() {
    this.files.clear();
  }
}
