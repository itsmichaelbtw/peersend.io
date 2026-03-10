/**
 * Unit tests for createBufferWithHeader and parseTransitBuffer.
 * Imported directly from the web source.
 *
 * Note: parseTransitBuffer returns { fileId: string, chunk: Uint8Array }
 * where fileId is a UUID string decoded from the 16-byte header.
 */

import { test, expect } from "@playwright/test";
import { createBufferWithHeader, parseTransitBuffer } from "../../src/lib/file-transfer/utils";
import { FILE_ID_BYTE_LENGTH } from "../../src/lib/file-transfer/constants";

function makeId(): Uint8Array {
  // A valid UUID v4 byte array: version nibble (byte 6 high) = 0x4, variant nibble (byte 8 high) = 0x8
  return new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x47, 0x08, 0x89, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10]);
}

test.describe("createBufferWithHeader + parseTransitBuffer", () => {
  test("round-trip: data bytes are preserved", () => {
    const id = makeId();
    const data = new Uint8Array([10, 20, 30, 40]);
    const framed = createBufferWithHeader(id, data);
    const { chunk } = parseTransitBuffer(framed);
    expect(Array.from(chunk)).toEqual(Array.from(data));
  });

  test("round-trip: fileId is a valid UUID string", () => {
    const id = makeId();
    const framed = createBufferWithHeader(id, new Uint8Array([1, 2, 3]));
    const { fileId } = parseTransitBuffer(framed);
    expect(typeof fileId).toBe("string");
    expect(fileId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test("total buffer length equals FILE_ID_BYTE_LENGTH + data.length", () => {
    const framed = createBufferWithHeader(makeId(), new Uint8Array(1024));
    expect(framed.length).toBe(FILE_ID_BYTE_LENGTH + 1024);
  });

  test("empty data produces a buffer of exactly FILE_ID_BYTE_LENGTH bytes", () => {
    const framed = createBufferWithHeader(makeId(), new Uint8Array(0));
    expect(framed.length).toBe(FILE_ID_BYTE_LENGTH);
    const { chunk } = parseTransitBuffer(framed);
    expect(chunk.length).toBe(0);
  });

  test("invalid id length throws", () => {
    expect(() => createBufferWithHeader(new Uint8Array(8), new Uint8Array(4))).toThrow();
  });

  test("large chunk is preserved faithfully", () => {
    const data = new Uint8Array(64 * 1024);
    for (let i = 0; i < data.length; i++) data[i] = i & 0xff;
    const framed = createBufferWithHeader(makeId(), data);
    const { chunk } = parseTransitBuffer(framed);
    expect(chunk.length).toBe(64 * 1024);
    expect(chunk[0]).toBe(0);
    expect(chunk[255]).toBe(255);
  });
});
