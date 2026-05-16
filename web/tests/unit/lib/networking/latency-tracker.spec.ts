import { test, expect } from "@playwright/test";

import { LatencyTracker } from "@/lib/networking/core/latency-tracker";
import { latencyState } from "@/state";

test.describe("LatencyTracker", () => {
	test("pong updates latency history in app state", () => {
		const originalNow = Date.now;
		Date.now = (): number => 2_000;
		latencyState.dispatch("CLEAR", null);

		try {
			const tracker = new LatencyTracker((): void => {});
			tracker.pong({ client_timestamp: 1_800, server_timestamp: 1_900 });
			expect(latencyState.get().history).toContain(200);
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

		latencyState.dispatch("SET_HISTORY", [42]);

		try {
			const tracker = new LatencyTracker((timestamp: number): void => {
				sent.push(timestamp);
			}, 1_000);
			tracker.start();
			expect(sent.length).toBeGreaterThan(0);
			tracker.stop();
			expect(latencyState.get().history).toEqual([]);
		} finally {
			(globalThis as unknown as { window: Window | undefined }).window = originalWindow;
			globalThis.setInterval = originalSetInterval;
			globalThis.clearInterval = originalClearInterval;
		}
	});
});
