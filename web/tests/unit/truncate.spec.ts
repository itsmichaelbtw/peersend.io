/**
 * Unit tests for truncateFileName.
 * Imported directly from the web source.
 */

import { test, expect } from "@playwright/test";
import { truncateFileName } from "../../src/lib/file-transfer/utils";

test.describe("truncateFileName", () => {
  test("short filename is unchanged", () => {
    expect(truncateFileName("hello.txt")).toBe("hello.txt");
  });

  test("exactly 35 chars is unchanged", () => {
    const name = "a".repeat(31) + ".txt";
    expect(name.length).toBe(35);
    expect(truncateFileName(name)).toBe(name);
  });

  test("long filename with extension is truncated to <= 35 chars", () => {
    expect(truncateFileName("a_very_long_filename_that_exceeds_the_limit.txt").length).toBeLessThanOrEqual(35);
  });

  test("truncated filename preserves extension", () => {
    expect(truncateFileName("a_very_long_filename_that_exceeds_the_limit.pdf").endsWith(".pdf")).toBe(true);
  });

  test("filename without extension truncated with ellipsis", () => {
    const result = truncateFileName("a_very_long_filename_that_exceeds_the_limit_and_has_no_extension");
    expect(result.length).toBeLessThanOrEqual(35);
    expect(result.includes("…")).toBe(true);
  });

  test("filename with special characters is handled", () => {
    expect(truncateFileName("file with spaces and symbols #$%^&!@() extras.txt").length).toBeLessThanOrEqual(35);
  });

  test("empty string returns empty string", () => {
    expect(truncateFileName("")).toBe("");
  });
});
