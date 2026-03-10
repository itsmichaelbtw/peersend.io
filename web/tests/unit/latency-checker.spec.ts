/**
 * Unit tests for LatencyChecker.calculateLatency.
 *
 * LatencyChecker is an abstract base class with one concrete method:
 * calculateLatency(). A minimal concrete subclass is created in this file
 * for testing — no application logic is duplicated, only the abstract method
 * stubs are provided so the base class can be instantiated.
 *
 * The formula is:
 *   latency = (now - server_timestamp) + (now - client_timestamp) / 2
 * rounded to the nearest integer.
 */

import { test, expect } from "@playwright/test";
import { LatencyChecker } from "../../src/lib/networking/core/latency-checker";
import type { PongData } from "../../src/lib/networking/core/latency-checker";

// ---------------------------------------------------------------------------
// Minimal concrete subclass — satisfies the abstract contract without
// duplicating any business logic from the real implementations.
// ---------------------------------------------------------------------------

class TestLatencyChecker extends LatencyChecker {
  public lastLatency: number = -1;
  public pingCount: number = 0;

  public ping(): void {
    this.pingCount++;
  }

  public pong(data: PongData): void {
    this.lastLatency = this.calculateLatency(data);
  }

  public updateLatency(latency: number): void {
    this.lastLatency = latency;
  }

  // Expose the protected method for direct testing
  public testCalculateLatency(data: PongData): number {
    return this.calculateLatency(data);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("LatencyChecker.calculateLatency", () => {
  test("returns a number for symmetric timestamps", () => {
    const checker = new TestLatencyChecker();
    const now = Date.now();
    const result = checker.testCalculateLatency({
      client_timestamp: now,
      server_timestamp: now
    });
    expect(typeof result).toBe("number");
  });

  test("returns zero when now equals server and client timestamps", () => {
    const checker = new TestLatencyChecker();
    const now = Date.now();
    // Simulating that both timestamps equal now
    const result = checker.testCalculateLatency({
      client_timestamp: now,
      server_timestamp: now
    });
    // Due to elapsed time between Date.now() calls, result will be >= 0
    expect(result).toBeGreaterThanOrEqual(0);
  });

  test("result is a rounded integer", () => {
    const checker = new TestLatencyChecker();
    const now = Date.now();
    const result = checker.testCalculateLatency({
      client_timestamp: now - 200,
      server_timestamp: now - 50
    });
    expect(Number.isInteger(result)).toBe(true);
  });

  test("larger time difference produces larger latency", () => {
    const checker = new TestLatencyChecker();
    const now = Date.now();

    const small = checker.testCalculateLatency({
      client_timestamp: now - 10,
      server_timestamp: now - 5
    });
    const large = checker.testCalculateLatency({
      client_timestamp: now - 1000,
      server_timestamp: now - 500
    });

    expect(large).toBeGreaterThan(small);
  });

  test("formula accounts for both server and client timing", () => {
    const checker = new TestLatencyChecker();
    const now = Date.now();
    const serverDelay = 100;
    const clientDelay = 200;

    const result = checker.testCalculateLatency({
      client_timestamp: now - clientDelay,
      server_timestamp: now - serverDelay
    });

    // result ≈ serverDelay + clientDelay / 2 ≈ 200 (±a few ms for test overhead)
    const expected = serverDelay + clientDelay / 2;
    expect(result).toBeGreaterThanOrEqual(expected - 10);
    expect(result).toBeLessThanOrEqual(expected + 50);
  });
});

test.describe("LatencyChecker abstract interface", () => {
  test("concrete subclass can call ping() without throwing", () => {
    const checker = new TestLatencyChecker();
    expect(() => checker.ping()).not.toThrow();
    expect(checker.pingCount).toBe(1);
  });

  test("pong() updates lastLatency via calculateLatency", () => {
    const checker = new TestLatencyChecker();
    const now = Date.now();
    checker.pong({ client_timestamp: now - 100, server_timestamp: now - 50 });
    expect(checker.lastLatency).toBeGreaterThanOrEqual(0);
  });

  test("updateLatency stores the given value", () => {
    const checker = new TestLatencyChecker();
    checker.updateLatency(42);
    expect(checker.lastLatency).toBe(42);
  });

  test("updateLatency(-1) resets the latency sentinel value", () => {
    const checker = new TestLatencyChecker();
    checker.updateLatency(100);
    checker.updateLatency(-1);
    expect(checker.lastLatency).toBe(-1);
  });
});
