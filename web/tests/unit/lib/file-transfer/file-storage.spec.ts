/**
 * Unit tests for FileStorage — extended coverage.
 *
 * Covers paths not exercised by the existing storage.spec.ts:
 *   - getNativeFile happy path and error conditions
 *   - markComplete with clearMemory=true
 *   - getChunks returns accumulated chunks
 *   - reset clears all records
 *   - getProgress for known and unknown ids
 *   - addChunk accumulates correctly across multiple chunks
 */

import { test, expect } from "@playwright/test";
import { FileStorage } from "@/lib/file-transfer/file-storage";

function makeStorage(): FileStorage {
  return new FileStorage();
}

test.describe("FileStorage — getNativeFile", () => {
  test("returns a File instance for a complete file", () => {
    const s = makeStorage();
    s.init("f1", 4);
    s.addChunk("f1", new Uint8Array([1, 2, 3, 4]));
    const file = s.getNativeFile("f1", {
      name: "test.txt",
      path: "",
      size: 4,
      type: "text/plain",
      lastModified: 0
    });
    expect(file).toBeInstanceOf(File);
  });

  test("returned File has the correct name from metadata", () => {
    const s = makeStorage();
    s.init("f1", 3);
    s.addChunk("f1", new Uint8Array([1, 2, 3]));
    const file = s.getNativeFile("f1", {
      name: "hello.bin",
      path: "",
      size: 3,
      type: "application/octet-stream",
      lastModified: 1000
    });
    expect(file.name).toBe("hello.bin");
  });

  test("returned File has the correct type from metadata", () => {
    const s = makeStorage();
    s.init("f1", 2);
    s.addChunk("f1", new Uint8Array([1, 2]));
    const file = s.getNativeFile("f1", {
      name: "img.png",
      path: "",
      size: 2,
      type: "image/png",
      lastModified: 0
    });
    expect(file.type).toBe("image/png");
  });

  test("throws for unknown file id", () => {
    const s = makeStorage();
    expect(() =>
      s.getNativeFile("ghost", { name: "x", path: "", size: 0, type: "", lastModified: 0 })
    ).toThrow();
  });

  test("throws when file is not yet complete", () => {
    const s = makeStorage();
    s.init("f1", 100);
    s.addChunk("f1", new Uint8Array(50)); // only 50 of 100 bytes
    expect(() =>
      s.getNativeFile("f1", { name: "x", path: "", size: 100, type: "", lastModified: 0 })
    ).toThrow();
  });
});

test.describe("FileStorage — markComplete", () => {
  test("markComplete without clearMemory preserves chunks", () => {
    const s = makeStorage();
    s.init("f1", 4);
    s.addChunk("f1", new Uint8Array([1, 2, 3, 4]));
    s.markComplete("f1", false);
    expect(s.getChunks("f1")?.length).toBeGreaterThan(0);
  });

  test("markComplete with clearMemory=true empties the chunks array", () => {
    const s = makeStorage();
    s.init("f1", 4);
    s.addChunk("f1", new Uint8Array([1, 2, 3, 4]));
    s.markComplete("f1", true);
    expect(s.getChunks("f1")).toEqual([]);
  });

  test("markComplete on unknown id is a no-op", () => {
    const s = makeStorage();
    expect(() => s.markComplete("ghost")).not.toThrow();
  });
});

test.describe("FileStorage — getChunks", () => {
  test("returns undefined for unknown id", () => {
    const s = makeStorage();
    expect(s.getChunks("ghost")).toBeUndefined();
  });

  test("returns empty array before any chunks are added", () => {
    const s = makeStorage();
    s.init("f1", 100);
    expect(s.getChunks("f1")).toEqual([]);
  });

  test("returns accumulated chunks in order", () => {
    const s = makeStorage();
    s.init("f1", 6);
    s.addChunk("f1", new Uint8Array([1, 2]));
    s.addChunk("f1", new Uint8Array([3, 4]));
    s.addChunk("f1", new Uint8Array([5, 6]));
    const chunks = s.getChunks("f1");
    expect(chunks?.length).toBe(3);
    expect(Array.from(chunks![0])).toEqual([1, 2]);
    expect(Array.from(chunks![2])).toEqual([5, 6]);
  });
});

test.describe("FileStorage — reset", () => {
  test("reset clears all file records", () => {
    const s = makeStorage();
    s.init("a", 10);
    s.init("b", 20);
    s.reset();
    expect(s.has("a")).toBe(false);
    expect(s.has("b")).toBe(false);
  });

  test("new files can be added after reset", () => {
    const s = makeStorage();
    s.init("a", 10);
    s.reset();
    s.init("a", 10); // re-init should not throw
    expect(s.has("a")).toBe(true);
  });
});

test.describe("FileStorage — getProgress", () => {
  test("returns 0 for unknown file id", () => {
    const s = makeStorage();
    expect(s.getProgress("ghost")).toBe(0);
  });

  test("returns 0 for a freshly initialised file with no chunks", () => {
    const s = makeStorage();
    s.init("f1", 100);
    expect(s.getProgress("f1")).toBe(0);
  });

  test("returns 100 for a fully received file", () => {
    const s = makeStorage();
    s.init("f1", 100);
    s.addChunk("f1", new Uint8Array(100));
    expect(s.getProgress("f1")).toBe(100);
  });

  test("returns 50 at half-way point", () => {
    const s = makeStorage();
    s.init("f1", 200);
    s.addChunk("f1", new Uint8Array(100));
    expect(s.getProgress("f1")).toBe(50);
  });
});

test.describe("FileStorage — multi-chunk accumulation", () => {
  test("addChunk accumulates byte counts across calls", () => {
    const s = makeStorage();
    s.init("f1", 300);
    s.addChunk("f1", new Uint8Array(100));
    s.addChunk("f1", new Uint8Array(100));
    const progress = s.addChunk("f1", new Uint8Array(100));
    expect(progress).toBe(100);
    expect(s.isComplete("f1")).toBe(true);
  });

  test("isComplete returns false until all bytes arrive", () => {
    const s = makeStorage();
    s.init("f1", 100);
    s.addChunk("f1", new Uint8Array(99));
    expect(s.isComplete("f1")).toBe(false);
    s.addChunk("f1", new Uint8Array(1));
    expect(s.isComplete("f1")).toBe(true);
  });
});
