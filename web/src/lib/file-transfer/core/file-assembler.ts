interface FileState {
  chunks: Uint8Array[];
  bytesReceived: number;
  totalSize: number;
}

export class FileAssembler {
  private files = new Map<string, FileState>();

  public init(fileId: string, totalSize: number): void {
    if (this.files.has(fileId)) {
      return;
    }

    this.files.set(fileId, {
      chunks: [],
      bytesReceived: 0,
      totalSize: totalSize
    });
  }

  public addChunk(fileId: string, chunk: Uint8Array): void {
    const file = this.files.get(fileId);

    if (!file) {
      throw new Error(`File ${fileId} not initialized`);
    }

    file.chunks.push(chunk);
    file.bytesReceived += chunk.byteLength;
  }

  public getProgress(fileId: string): number {
    const file = this.files.get(fileId);

    if (!file) {
      return 0;
    }

    return Math.round((file.bytesReceived / file.totalSize) * 100);
  }

  public isComplete(fileId: string): boolean {
    const file = this.files.get(fileId);

    if (!file) {
      return false;
    }

    return file.bytesReceived >= file.totalSize;
  }

  public reconstruct(fileId: string): Uint8Array {
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

  public reset(fileId: string) {
    this.files.delete(fileId);
  }

  public resetAll() {
    this.files.clear();
  }
}

export const fileAssembler = new FileAssembler();
