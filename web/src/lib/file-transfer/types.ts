export type FileType = File | ArrayBuffer | Uint8Array;

export interface ChunkMetadata {
  totalChunks: number;
}

export interface FileChunk extends ChunkMetadata {
  groupId: string;
  bytes: Uint8Array;
}
