/**
 * Unit tests for AbortRegistry.
 *
 * AbortRegistry manages a set of named AbortControllers tied to a single
 * "session" lifetime. Tests cover: session start/end lifecycle, task
 * registration/abort, isActive state, and boundary/error conditions.
 *
 * Note: abortRegistry is a singleton — each test must call end() in cleanup
 * so that state does not bleed between tests.
 */

import { test, expect } from "@playwright/test";
import { abortRegistry } from "../../src/lib/networking/core/abort-registry";

test.describe("AbortRegistry", () => {
  test.afterEach(() => {
    // Always reset singleton state between tests
    try { abortRegistry.end(); } catch { /* already ended */ }
  });

  test("register throws when no active session exists", () => {
    expect(() => abortRegistry.register("task-1")).toThrow("No active session exists");
  });

  test("start enables task registration", () => {
    abortRegistry.start();
    expect(() => abortRegistry.register("task-1")).not.toThrow();
  });

  test("start is idempotent — calling twice does not throw", () => {
    abortRegistry.start();
    expect(() => abortRegistry.start()).not.toThrow();
  });

  test("registered task returns an AbortSignal", () => {
    abortRegistry.start();
    const signal = abortRegistry.register("task-1");
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  test("registered task is initially active (not aborted)", () => {
    abortRegistry.start();
    abortRegistry.register("task-1");
    expect(abortRegistry.isActive("task-1")).toBe(true);
  });

  test("abort(id) marks the task as no longer active", () => {
    abortRegistry.start();
    abortRegistry.register("task-1");
    abortRegistry.abort("task-1");
    expect(abortRegistry.isActive("task-1")).toBe(false);
  });

  test("abort(id) causes the signal to be aborted", () => {
    abortRegistry.start();
    const signal = abortRegistry.register("task-1");
    abortRegistry.abort("task-1");
    expect(signal.aborted).toBe(true);
  });

  test("abort on unknown id is a no-op", () => {
    abortRegistry.start();
    expect(() => abortRegistry.abort("ghost")).not.toThrow();
  });

  test("isActive returns false for unknown id", () => {
    abortRegistry.start();
    expect(abortRegistry.isActive("ghost")).toBe(false);
  });

  test("end() aborts all registered tasks", () => {
    abortRegistry.start();
    const s1 = abortRegistry.register("task-1");
    const s2 = abortRegistry.register("task-2");

    abortRegistry.end();

    expect(s1.aborted).toBe(true);
    expect(s2.aborted).toBe(true);
  });

  test("end() clears all tasks so isActive returns false afterwards", () => {
    abortRegistry.start();
    abortRegistry.register("task-1");
    abortRegistry.end();

    expect(abortRegistry.isActive("task-1")).toBe(false);
  });

  test("end() without a started session is a no-op", () => {
    expect(() => abortRegistry.end()).not.toThrow();
  });

  test("new session can be started after end()", () => {
    abortRegistry.start();
    abortRegistry.register("task-1");
    abortRegistry.end();

    // start a fresh session
    abortRegistry.start();
    const signal = abortRegistry.register("task-fresh");
    expect(signal.aborted).toBe(false);
  });

  test("tasks from previous session are not carried into new session", () => {
    abortRegistry.start();
    abortRegistry.register("task-old");
    abortRegistry.end();

    abortRegistry.start();
    // task-old should not exist in the new session
    expect(abortRegistry.isActive("task-old")).toBe(false);
  });

  test("multiple tasks can be individually aborted", () => {
    abortRegistry.start();
    const s1 = abortRegistry.register("task-1");
    const s2 = abortRegistry.register("task-2");

    abortRegistry.abort("task-1");

    expect(s1.aborted).toBe(true);
    expect(s2.aborted).toBe(false);
    expect(abortRegistry.isActive("task-2")).toBe(true);
  });
});
