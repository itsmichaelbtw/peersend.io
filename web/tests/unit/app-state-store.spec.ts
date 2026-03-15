/**
 * Unit tests for AppStateStore reducer logic.
 *
 * AppStateStore extends the abstract StateStore<S, M> and contains the main
 * app state transitions. Each test instantiates a FRESH store so singleton
 * state from `appState` never leaks into the test environment.
 *
 * Covered actions:
 *   UPDATE, SET_SESSION_INFORMATION, SET_CLIENTS, SET_HOST,
 *   SET_LAST_ERROR, RESET_CONNECTING_STATES
 * Covered infrastructure:
 *   subscribe/unsubscribe, dispatch triggers listeners, deep-merge behaviour
 */

import { test, expect } from "@playwright/test";
import { AppStateStore } from "../../src/state/app-state/store";
import type { AppState } from "../../src/state/types";
import type { WebSocketDataSessionInformation } from "../../src/lib/networking/websocket/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInitialState(): AppState {
  return {
    sessionState: {
      sessionCode: null,
      isHost: false,
      isConnected: false,
      autoWebRTC: false,
      encryptionMode: "none",
      latency: -1,
      clientId: null,
      clients: [],
      maximumClients: 0,
      lastError: null,
      connectionType: "none"
    },
    webrtcState: {
      dataChannel: null,
      isConnected: false,
      isConnecting: false
    },
    websocketState: {
      ws: null,
      isConnected: false,
      isConnecting: false
    }
  };
}

function makeStore(): AppStateStore {
  return new AppStateStore(makeInitialState());
}

function makeSessionInfo(): WebSocketDataSessionInformation {
  return {
    session_code: "ABCDE",
    client_id: "client-1",
    host_id: "client-1",
    clients: ["client-1"],
    maximum_clients: 5,
    connection_type: "websocket" as const,
    encryption_mode: "none" as const,
    auto_webrtc: false
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("AppStateStore — subscribe / listener infrastructure", () => {
  test("get() returns the initial state", () => {
    const store = makeStore();
    const state = store.get();
    expect(state.sessionState.isConnected).toBe(false);
    expect(state.websocketState.ws).toBeNull();
  });

  test("subscribe listener is called after dispatch", () => {
    const store = makeStore();
    let callCount = 0;

    store.subscribe(() => { callCount++; });
    store.dispatch("RESET_CONNECTING_STATES", null);

    expect(callCount).toBe(1);
  });

  test("subscribe returns an unsubscribe function", () => {
    const store = makeStore();
    let callCount = 0;

    const unsub = store.subscribe(() => { callCount++; });
    unsub();

    store.dispatch("RESET_CONNECTING_STATES", null);
    expect(callCount).toBe(0);
  });

  test("multiple listeners are all notified", () => {
    const store = makeStore();
    const log: number[] = [];

    store.subscribe(() => log.push(1));
    store.subscribe(() => log.push(2));

    store.dispatch("RESET_CONNECTING_STATES", null);
    expect(log).toEqual([1, 2]);
  });

  test("listener receives the updated state, not the old one", () => {
    const store = makeStore();
    let receivedState: AppState | null = null;

    store.subscribe((s) => { receivedState = s; });
    store.dispatch("UPDATE", { websocketState: { isConnecting: true } });

    expect(receivedState!.websocketState.isConnecting).toBe(true);
  });
});

test.describe("AppStateStore — UPDATE action", () => {
  test("UPDATE merges top-level keys shallowly", () => {
    const store = makeStore();
    store.dispatch("UPDATE", { websocketState: { isConnecting: true } });
    expect(store.get().websocketState.isConnecting).toBe(true);
    // other keys should remain
    expect(store.get().websocketState.ws).toBeNull();
  });

  test("UPDATE merges nested objects (deep merge for one level)", () => {
    const store = makeStore();
    store.dispatch("UPDATE", {
      sessionState: { isConnected: true, sessionCode: "ABCDE" }
    });
    const s = store.get().sessionState;
    expect(s.isConnected).toBe(true);
    expect(s.sessionCode).toBe("ABCDE");
    // untouched sub-key remains
    expect(s.isHost).toBe(false);
  });

  test("UPDATE with multiple slices updates each independently", () => {
    const store = makeStore();
    store.dispatch("UPDATE", {
      websocketState: { isConnected: true },
      webrtcState: { isConnecting: true }
    });
    expect(store.get().websocketState.isConnected).toBe(true);
    expect(store.get().webrtcState.isConnecting).toBe(true);
  });

  test("UPDATE does not mutate other unrelated state slices", () => {
    const store = makeStore();
    const before = store.get().sessionState;

    store.dispatch("UPDATE", { websocketState: { isConnected: true } });

    expect(store.get().sessionState).toEqual(before);
  });
});

test.describe("AppStateStore — SET_SESSION_INFORMATION action", () => {
  test("marks session as connected with correct sessionCode", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo());
    expect(store.get().sessionState.isConnected).toBe(true);
    expect(store.get().sessionState.sessionCode).toBe("ABCDE");
  });

  test("sets clientId correctly", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo());
    expect(store.get().sessionState.clientId).toBe("client-1");
  });

  test("sets isHost=true when client_id matches host_id", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo()); // host_id === client_id
    expect(store.get().sessionState.isHost).toBe(true);
  });

  test("sets isHost=false when client_id does not match host_id", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", {
      ...makeSessionInfo(),
      host_id: "other-client"
    });
    expect(store.get().sessionState.isHost).toBe(false);
  });

  test("stores the clients list", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", {
      ...makeSessionInfo(),
      clients: ["client-1", "client-2"]
    });
    expect(store.get().sessionState.clients).toEqual(["client-1", "client-2"]);
  });

  test("sets maximumClients correctly", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", { ...makeSessionInfo(), maximum_clients: 10 });
    expect(store.get().sessionState.maximumClients).toBe(10);
  });

  test("marks websocket as connected and not connecting", () => {
    const store = makeStore();
    // Pre-set isConnecting so we can verify it's cleared
    store.dispatch("UPDATE", { websocketState: { isConnecting: true } });
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo());
    expect(store.get().websocketState.isConnected).toBe(true);
    expect(store.get().websocketState.isConnecting).toBe(false);
  });

  test("resets webrtc connected state", () => {
    const store = makeStore();
    store.dispatch("UPDATE", { webrtcState: { isConnected: true } });
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo());
    expect(store.get().webrtcState.isConnected).toBe(false);
  });

  test("clears lastError", () => {
    const store = makeStore();
    store.dispatch("SET_LAST_ERROR", { title: "Old", message: "Error" });
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo());
    expect(store.get().sessionState.lastError).toBeNull();
  });
});

test.describe("AppStateStore — SET_CLIENTS action", () => {
  test("replaces the clients array", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo());
    store.dispatch("SET_CLIENTS", { clients: ["client-1", "client-2", "client-3"] });
    expect(store.get().sessionState.clients).toEqual(["client-1", "client-2", "client-3"]);
  });

  test("sets clients to empty array when payload is empty", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo());
    store.dispatch("SET_CLIENTS", { clients: [] });
    expect(store.get().sessionState.clients).toEqual([]);
  });
});

test.describe("AppStateStore — SET_HOST action", () => {
  test("sets isHost=true when host_id matches current clientId", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo()); // client-1 is host
    store.dispatch("SET_HOST", { host_id: "client-1" });
    expect(store.get().sessionState.isHost).toBe(true);
  });

  test("sets isHost=false when host_id does not match clientId", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo()); // client-1 is current
    store.dispatch("SET_HOST", { host_id: "client-2" });
    expect(store.get().sessionState.isHost).toBe(false);
  });
});

test.describe("AppStateStore — SET_LAST_ERROR action", () => {
  test("stores the error data in sessionState.lastError", () => {
    const store = makeStore();
    store.dispatch("SET_LAST_ERROR", { title: "Oops", message: "Something went wrong" });
    expect(store.get().sessionState.lastError).toEqual({
      title: "Oops",
      message: "Something went wrong"
    });
  });

  test("clears lastError when payload is null", () => {
    const store = makeStore();
    store.dispatch("SET_LAST_ERROR", { title: "Err", message: "msg" });
    store.dispatch("SET_LAST_ERROR", null);
    expect(store.get().sessionState.lastError).toBeNull();
  });

  test("sets websocket isConnecting to false", () => {
    const store = makeStore();
    store.dispatch("UPDATE", { websocketState: { isConnecting: true } });
    store.dispatch("SET_LAST_ERROR", { title: "E", message: "M" });
    expect(store.get().websocketState.isConnecting).toBe(false);
  });

  test("sets webrtc isConnecting to false", () => {
    const store = makeStore();
    store.dispatch("UPDATE", { webrtcState: { isConnecting: true } });
    store.dispatch("SET_LAST_ERROR", { title: "E", message: "M" });
    expect(store.get().webrtcState.isConnecting).toBe(false);
  });
});

test.describe("AppStateStore — RESET_CONNECTING_STATES action", () => {
  test("clears websocket isConnecting", () => {
    const store = makeStore();
    store.dispatch("UPDATE", { websocketState: { isConnecting: true } });
    store.dispatch("RESET_CONNECTING_STATES", null);
    expect(store.get().websocketState.isConnecting).toBe(false);
  });

  test("clears webrtc isConnecting", () => {
    const store = makeStore();
    store.dispatch("UPDATE", { webrtcState: { isConnecting: true } });
    store.dispatch("RESET_CONNECTING_STATES", null);
    expect(store.get().webrtcState.isConnecting).toBe(false);
  });

  test("does not alter sessionState or connected flags", () => {
    const store = makeStore();
    store.dispatch("SET_SESSION_INFORMATION", makeSessionInfo());
    store.dispatch("RESET_CONNECTING_STATES", null);

    expect(store.get().sessionState.isConnected).toBe(true);
    expect(store.get().websocketState.isConnected).toBe(true);
  });
});
