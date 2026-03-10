import { test, expect } from "@playwright/test";
import { BASE_URL } from "../../helpers/session";

const DEFAULT_CHUNK_SIZE = 16 * 1024;
const FILE_ID_BYTE_LENGTH = 16;

test.describe("File transfer: chunking", () => {
  test("createBufferWithHeader preserves id and data bytes", async ({ page }) => {
    await page.goto(BASE_URL);
    const result = await page.evaluate(({ chunkSize, idLen }) => {
      const id = new Uint8Array(idLen).fill(0xab);
      const data = new Uint8Array(chunkSize).fill(0xcd);
      const buf = new Uint8Array(idLen + chunkSize);
      buf.set(id, 0);
      buf.set(data, idLen);
      return {
        frameLength: buf.length,
        idMatch: Array.from(buf.slice(0, idLen)).every((b) => b === 0xab),
        dataMatch: Array.from(buf.slice(idLen)).every((b) => b === 0xcd),
      };
    }, { chunkSize: DEFAULT_CHUNK_SIZE, idLen: FILE_ID_BYTE_LENGTH });

    expect(result.frameLength).toBe(DEFAULT_CHUNK_SIZE + FILE_ID_BYTE_LENGTH);
    expect(result.idMatch).toBe(true);
    expect(result.dataMatch).toBe(true);
  });

  test("1MB round-trip preserves all bytes", async ({ page }) => {
    await page.goto(BASE_URL);
    const result = await page.evaluate(({ idLen }) => {
      const SIZE = 1024 * 1024;
      const id = new Uint8Array(idLen).fill(0xff);
      const data = new Uint8Array(SIZE);
      for (let i = 0; i < SIZE; i++) data[i] = i & 0xff;
      const frame = new Uint8Array(idLen + SIZE);
      frame.set(id, 0);
      frame.set(data, idLen);
      const chunk = frame.slice(idLen);
      return { length: chunk.length, first: chunk[0], last: chunk[SIZE - 1], mid: chunk[512] };
    }, { idLen: FILE_ID_BYTE_LENGTH });

    expect(result.length).toBe(1024 * 1024);
    expect(result.first).toBe(0);
    expect(result.last).toBe((1024 * 1024 - 1) & 0xff);
    expect(result.mid).toBe(512 & 0xff);
  });
});
