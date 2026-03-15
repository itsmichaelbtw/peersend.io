import { test, expect } from "@playwright/test";

import { NetworkClient } from "@/lib/networking/core/network-client";
import { LatencyTracker } from "@/lib/networking/core/latency-tracker";
import type { NetworkMessagePayload } from "@/lib/networking/types";

type Incoming =
	| NetworkMessagePayload<"alpha", { value: number }>
	| NetworkMessagePayload<"beta", { ok: boolean }>;
type Outgoing = NetworkMessagePayload<"ping", { at: number }>;
type Context = { source: "ws" | "rtc" };

class TestClient extends NetworkClient<Incoming, Outgoing, Context> {
	public constructor(tracker: LatencyTracker) {
		super(tracker);
	}

	public connect(): Promise<this> {
		return Promise.resolve(this);
	}

	public disconnect(): this {
		return this;
	}

	public reset(): this {
		return this;
	}

	public emit(): this {
		return this;
	}
}

test.describe("NetworkClient", () => {
	test("registerEvents binds handlers to message bus and supports context", () => {
		const client = new TestClient(new LatencyTracker((): void => {}));
		client.messageBus.setContext({ source: "rtc" });

		let seen = "";
		client.registerEvents({
			alpha: (data, context): void => {
				seen = `${context.source}:${data.value}`;
			},
			beta: (): void => {}
		});

		client.messageBus.emit("alpha", { value: 7 });
		expect(seen).toBe("rtc:7");
	});

	test("startLatencyMonitoring and stopLatencyMonitoring delegate to tracker", () => {
		const tracker = new LatencyTracker((): void => {});
		let started = false;
		let stopped = false;

		tracker.start = (): void => {
			started = true;
		};
		tracker.stop = (): void => {
			stopped = true;
		};

		const client = new TestClient(tracker);
		client.startLatencyMonitoring();
		client.stopLatencyMonitoring();

		expect(started).toBe(true);
		expect(stopped).toBe(true);
	});

	test("pong delegates to tracker.pong", () => {
		const tracker = new LatencyTracker((): void => {});
		let delegated = false;

		tracker.pong = (): void => {
			delegated = true;
		};

		const client = new TestClient(tracker);
		client.pong({ client_timestamp: 1, server_timestamp: 1 });
		expect(delegated).toBe(true);
	});
});
