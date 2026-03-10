/**
 * Unit tests for withDispatchReducer.
 *
 * withDispatchReducer is the pure function at the heart of the StateStore
 * dispatch mechanism. It wraps a reducer-like function and handles the
 * special DISPATCH action type by merging state directly, delegating all
 * other action types to the provided function.
 */

import { test, expect } from "@playwright/test";
import { withDispatchReducer } from "../../src/context/context.dispatch";

type TestState = { count: number; label: string; nested: { x: number } };

const initialState: TestState = { count: 0, label: "init", nested: { x: 1 } };

test.describe("withDispatchReducer — DISPATCH action", () => {
  test("DISPATCH merges payload into state shallowly", () => {
    const apply = withDispatchReducer<Record<string, unknown>, TestState>(
      initialState,
      { type: "DISPATCH", payload: { count: 99 } }
    );
    const next = apply(() => ({}));
    expect(next.count).toBe(99);
  });

  test("DISPATCH preserves unmentioned keys", () => {
    const apply = withDispatchReducer<Record<string, unknown>, TestState>(
      initialState,
      { type: "DISPATCH", payload: { count: 5 } }
    );
    const next = apply(() => ({}));
    expect(next.label).toBe("init");
  });

  test("DISPATCH with empty payload returns state unchanged", () => {
    const apply = withDispatchReducer<Record<string, unknown>, TestState>(
      initialState,
      { type: "DISPATCH", payload: {} }
    );
    const next = apply(() => ({}));
    expect(next).toEqual(initialState);
  });

  test("DISPATCH does NOT call the provided function", () => {
    let called = false;
    const apply = withDispatchReducer<Record<string, unknown>, TestState>(
      initialState,
      { type: "DISPATCH", payload: { count: 1 } }
    );
    apply(() => {
      called = true;
      return {};
    });
    expect(called).toBe(false);
  });
});

test.describe("withDispatchReducer — non-DISPATCH action", () => {
  test("non-DISPATCH action calls the provided function", () => {
    let called = false;
    const apply = withDispatchReducer<Record<string, unknown>, TestState>(
      initialState,
      { type: "INCREMENT" as unknown as "DISPATCH", payload: {} }
    );
    apply(() => {
      called = true;
      return { count: initialState.count + 1 };
    });
    expect(called).toBe(true);
  });

  test("non-DISPATCH merges return value of fn into state", () => {
    const apply = withDispatchReducer<Record<string, unknown>, TestState>(
      initialState,
      { type: "SET_LABEL" as unknown as "DISPATCH", payload: {} }
    );
    const next = apply(() => ({ label: "updated" }));
    expect(next.label).toBe("updated");
    expect(next.count).toBe(0); // unchanged
  });

  test("non-DISPATCH fn returning empty object leaves state intact", () => {
    const apply = withDispatchReducer<Record<string, unknown>, TestState>(
      initialState,
      { type: "NOOP" as unknown as "DISPATCH", payload: {} }
    );
    const next = apply(() => ({}));
    expect(next).toEqual(initialState);
  });

  test("non-DISPATCH fn can override multiple keys", () => {
    const apply = withDispatchReducer<Record<string, unknown>, TestState>(
      initialState,
      { type: "RESET" as unknown as "DISPATCH", payload: {} }
    );
    const next = apply(() => ({ count: 42, label: "reset" }));
    expect(next.count).toBe(42);
    expect(next.label).toBe("reset");
  });
});
