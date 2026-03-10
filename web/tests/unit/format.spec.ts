/**
 * Unit tests for formatFileSize.
 * Imported directly from the web source.
 */

import { test, expect } from "@playwright/test";
import { formatFileSize } from "../../src/lib/file-transfer/utils";

test.describe("formatFileSize", () => {
  test("0 bytes returns '0 B'", () => expect(formatFileSize(0)).toBe("0 B"));
  test("1 byte", () => expect(formatFileSize(1)).toBe("1 B"));
  test("1024 bytes returns '1 KB'", () => expect(formatFileSize(1024)).toBe("1 KB"));
  test("1 MB", () => expect(formatFileSize(1024 * 1024)).toBe("1 MB"));
  test("1 GB", () => expect(formatFileSize(1024 ** 3)).toBe("1 GB"));
  test("512 KB", () => expect(formatFileSize(512 * 1024)).toBe("512 KB"));

  test("decimals param is respected", () => {
    expect(formatFileSize(1536, 1)).toBe("1.5 KB");
  });

  test("1023 bytes is shown in B not KB", () => {
    expect(formatFileSize(1023)).not.toContain("KB");
  });
});
