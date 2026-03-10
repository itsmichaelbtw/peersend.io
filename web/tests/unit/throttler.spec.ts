/**
 * Unit tests for ProgressThrottler.
 * Imported directly from the web source. The logger is replaced with a no-op
 * shim via the @/utils/logger path alias in tsconfig.json.
 */

import { test, expect } from "@playwright/test";
import { ProgressThrottler } from "../../src/lib/file-transfer/progress-throttler";

test.describe("ProgressThrottler", () => {
  test("allows update when threshold and time delta are met", async () => {
    const t = new ProgressThrottler(1, 0);
    await new Promise((r) => setTimeout(r, 5));
    expect(t.canUpdate(10)).toBe(true);
  });

  test("always allows update at 100%", () => {
    const t = new ProgressThrottler(1, 100_000);
    expect(t.canUpdate(100)).toBe(true);
  });

  test("throttles when time delta is too small", () => {
    const t = new ProgressThrottler(1, 10_000);
    expect(t.canUpdate(50)).toBe(false);
  });

  test("throttles when percentage change is below threshold", async () => {
    const t = new ProgressThrottler(5, 0);
    await new Promise((r) => setTimeout(r, 5));
    t.canUpdate(1);
    await new Promise((r) => setTimeout(r, 5));
    expect(t.canUpdate(3)).toBe(false);
  });

  test("reset allows updates from zero again", async () => {
    const t = new ProgressThrottler(1, 0);
    await new Promise((r) => setTimeout(r, 5));
    t.canUpdate(50);
    t.reset();
    await new Promise((r) => setTimeout(r, 5));
    expect(t.canUpdate(10)).toBe(true);
  });
});
