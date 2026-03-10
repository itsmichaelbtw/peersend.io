/**
 * Unit tests for FileStorage.
 * Imported directly from the web source. The logger is replaced with a no-op
 * shim via the @/utils/logger path alias in tsconfig.json.
 */

import { test, expect } from "@playwright/test";
import { FileStorage } from "../../src/lib/file-transfer/file-storage";

test.describe("FileStorage", () => {
	test("init creates a record", () => {
		const s = new FileStorage();
		s.init("f1", 1024);
		expect(s.has("f1")).toBe(true);
	});

	test("init is idempotent", () => {
		const s = new FileStorage();
		s.init("f1", 1024);
		s.addChunk("f1", new Uint8Array(512));
		s.init("f1", 1024);
		expect(s.isComplete("f1")).toBe(false);
	});

	test("addChunk throws for uninitialised file", () => {
		expect(() => new FileStorage().addChunk("ghost", new Uint8Array(10))).toThrow();
	});

	test("addChunk returns progress percentage", () => {
		const s = new FileStorage();
		s.init("f1", 100);
		expect(s.addChunk("f1", new Uint8Array(50))).toBe(50);
	});

	test("isComplete returns true when all bytes received", () => {
		const s = new FileStorage();
		s.init("f1", 100);
		s.addChunk("f1", new Uint8Array(100));
		expect(s.isComplete("f1")).toBe(true);
	});

	test("isComplete returns true immediately for 0-byte file (bug fix)", () => {
		const s = new FileStorage();
		s.init("empty", 0);
		expect(s.isComplete("empty")).toBe(true);
	});

	test("multiple files tracked independently", () => {
		const s = new FileStorage();
		s.init("a", 100);
		s.init("b", 200);
		s.addChunk("a", new Uint8Array(100));
		expect(s.isComplete("a")).toBe(true);
		expect(s.isComplete("b")).toBe(false);
	});

	test("remove deletes the record", () => {
		const s = new FileStorage();
		s.init("f1", 10);
		s.remove("f1");
		expect(s.has("f1")).toBe(false);
	});
});
