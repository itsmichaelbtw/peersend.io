import { test, expect } from "@playwright/test";

import { LatencyTracker } from "@/lib/networking/core/latency-tracker";
import { appState } from "@/state/app-state/state";

test.describe("LatencyTracker", () => {
	test("pong updates session latency in app state", () => {
		const originalNow = Date.now;
		Date.now = (): number => 2_000;
		appState.dispatch("UPDATE", { sessionState: { latency: -1 } });

		try {
			const tracker = new LatencyTracker((): void => {});
			tracker.pong({ client_timestamp: 1_800, server_timestamp: 1_900 });
			expect(appState.get().sessionState.latency).toBe(200);
		} finally {
			Date.now = originalNow;
		}
	});

	test("start sends ping immediately and stop resets latency", () => {
		const sent: number[] = [];
		const originalWindow = globalThis.window;
		const originalSetInterval = globalThis.setInterval;
		const originalClearInterval = globalThis.clearInterval;

		let intervalId = 0;
		const fakeWindow = {
			setInterval: (cb: () => void): number => {
				cb();
				return ++intervalId;
			},
			clearInterval: (): void => {}
		} as unknown as Window;

		(globalThis as unknown as { window: Window }).window = fakeWindow;
		globalThis.setInterval = ((() => ++intervalId) as unknown) as typeof globalThis.setInterval;
		globalThis.clearInterval = ((() => {}) as unknown) as typeof globalThis.clearInterval;

		appState.dispatch("UPDATE", { sessionState: { latency: 42 } });

		try {
			const tracker = new LatencyTracker((timestamp: number): void => {
				sent.push(timestamp);
			}, 1_000);
			tracker.start();
			expect(sent.length).toBeGreaterThan(0);
			tracker.stop();
			expect(appState.get().sessionState.latency).toBe(-1);
		} finally {
			(globalThis as unknown as { window: Window | undefined }).window = originalWindow;
			globalThis.setInterval = originalSetInterval;
			globalThis.clearInterval = originalClearInterval;
		}
	});
});
