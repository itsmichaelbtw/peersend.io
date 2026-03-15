/**
 * Unit tests for FileChunker.
 * These tests import and exercise the real FileChunker implementation.
 */

import { test, expect } from "@playwright/test";
import { DEFAULT_CHUNK_SIZE } from "@/lib/file-transfer/constants";
import { FileChunker } from "@/lib/file-transfer/file-chunker";

async function collectChunks(file: File, chunkSize?: number): Promise<Uint8Array[]> {
  const chunks: Uint8Array[] = [];
  const chunker = new FileChunker(file);
  for await (const c of chunker.chunk(chunkSize)) {
    chunks.push(c);
  }
  return chunks;
}

function fileFromBytes(bytes: Uint8Array, name = "test.bin"): File {
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  return new File([buffer], name, { type: "application/octet-stream" });
}

test.describe("FileChunker", () => {
  test("empty buffer produces zero chunks", async () => {
    expect((await collectChunks(fileFromBytes(new Uint8Array(0)))).length).toBe(0);
  });

  test("single byte produces one chunk", async () => {
    const chunks = await collectChunks(fileFromBytes(new Uint8Array([42])));
    expect(chunks.length).toBe(1);
    expect(chunks[0][0]).toBe(42);
  });

  test("file exactly one chunk-size produces one chunk", async () => {
    const chunks = await collectChunks(fileFromBytes(new Uint8Array(DEFAULT_CHUNK_SIZE).fill(7)));
    expect(chunks.length).toBe(1);
    expect(chunks[0].length).toBe(DEFAULT_CHUNK_SIZE);
  });

  test("file one byte over chunk-size produces two chunks", async () => {
    const chunks = await collectChunks(fileFromBytes(new Uint8Array(DEFAULT_CHUNK_SIZE + 1).fill(3)));
    expect(chunks.length).toBe(2);
    expect(chunks[1].length).toBe(1);
  });

  test("all bytes reassembled match original", async () => {
    const data = new Uint8Array(50_000);
    for (let i = 0; i < data.length; i++) data[i] = i & 0xff;
    const chunks = await collectChunks(fileFromBytes(data), 8192);
    const out = new Uint8Array(data.length);
    let off = 0;
    for (const c of chunks) { out.set(c, off); off += c.length; }
    expect(Array.from(out)).toEqual(Array.from(data));
  });

  test("chunk sizes sum to file size", async () => {
    const data = new Uint8Array(100_003).fill(1);
    const chunks = await collectChunks(fileFromBytes(data), 16384);
    expect(chunks.reduce((s, c) => s + c.length, 0)).toBe(100_003);
  });

  test("last chunk has correct remainder size", async () => {
    const chunks = await collectChunks(fileFromBytes(new Uint8Array(3500).fill(255)), 1000);
    expect(chunks.length).toBe(4);
    expect(chunks[3].length).toBe(500);
  });
});
