/**
 * Unit tests for MessageBus.
 *
 * MessageBus is the core pub-sub event router used by WebSocket and WebRTC
 * clients. Tests cover: on/off/emit lifecycle, multiple handlers, error
 * isolation, and async handler error catching.
 */

import { test, expect } from "@playwright/test";
import { MessageBus } from "@/lib/networking/core/message-bus";

type TestEvents = "event_a" | "event_b" | "event_c";

test.describe("MessageBus", () => {
	test("handlers receive configured context object", () => {
		const bus = new MessageBus<TestEvents, { transport: "webrtc" | "websocket" }>();
		bus.setContext({ transport: "webrtc" });
		let seenContext = "";

		bus.on("event_a", (_data, context) => {
			seenContext = context.transport;
		});

		bus.emit("event_a", null);
		expect(seenContext).toBe("webrtc");
	});

	test("setContext updates context used by later emits", () => {
		const bus = new MessageBus<TestEvents, { id: string }>();
		const seen: string[] = [];

		bus.on("event_a", (_data, context) => {
			seen.push(context.id);
		});

		bus.setContext({ id: "first" });
		bus.emit("event_a", null);
		bus.setContext({ id: "second" });
		bus.emit("event_a", null);

		expect(seen).toEqual(["first", "second"]);
	});

	test("registered handler receives emitted data", () => {
		const bus = new MessageBus<TestEvents>();
		let received: unknown;

		bus.on("event_a", (data) => {
			received = data;
		});

		bus.emit("event_a", { value: 42 });
		expect(received).toEqual({ value: 42 });
	});

	test("handler is not called for a different event", () => {
		const bus = new MessageBus<TestEvents>();
		let called = false;

		bus.on("event_a", () => {
			called = true;
		});

		bus.emit("event_b", {});
		expect(called).toBe(false);
	});

	test("multiple handlers for same event all receive the data", () => {
		const bus = new MessageBus<TestEvents>();
		const received: number[] = [];

		bus.on<number>("event_a", (d) => void received.push(d));
		bus.on<number>("event_a", (d) => void received.push(d * 2));

		bus.emit("event_a", 5);
		expect(received).toEqual([5, 10]);
	});

	test("off removes only the specific handler", () => {
		const bus = new MessageBus<TestEvents>();
		const calls: string[] = [];

		const h1 = (): void => {
			calls.push("h1");
		};
		const h2 = (): void => {
			calls.push("h2");
		};

		bus.on("event_a", h1);
		bus.on("event_a", h2);
		bus.off("event_a", h1);

		bus.emit("event_a", null);
		expect(calls).toEqual(["h2"]);
	});

	test("off on non-existent event is a no-op", () => {
		const bus = new MessageBus<TestEvents>();
		expect(() => bus.off("event_a", () => {})).not.toThrow();
	});

	test("emit on event with no handlers is a no-op", () => {
		const bus = new MessageBus<TestEvents>();
		expect(() => bus.emit("event_b", "data")).not.toThrow();
	});

	test("synchronous handler error does not crash other handlers", () => {
		const bus = new MessageBus<TestEvents>();
		let secondCalled = false;

		bus.on("event_a", () => {
			throw new Error("deliberate error");
		});
		bus.on("event_a", () => {
			secondCalled = true;
		});

		expect(() => bus.emit("event_a", {})).not.toThrow();
		expect(secondCalled).toBe(true);
	});

	test("async handler errors are caught silently", async () => {
		const bus = new MessageBus<TestEvents>();

		bus.on("event_a", () => {
			return Promise.reject(new Error("async error"));
		});

		expect(() => bus.emit("event_a", {})).not.toThrow();

		// give the microtask queue a tick
		await new Promise((r) => setTimeout(r, 10));
	});

	test("handlers receive the exact data passed to emit", () => {
		const bus = new MessageBus<TestEvents>();
		const obj = { nested: { value: true }, arr: [1, 2, 3] };
		let received: unknown;

		bus.on("event_a", (d) => {
			received = d;
		});
		bus.emit("event_a", obj);

		expect(received).toBe(obj); // same reference
	});

	test("re-registered handler after off receives events again", () => {
		const bus = new MessageBus<TestEvents>();
		const calls: number[] = [];

		const h = (d: unknown): void => {
			calls.push(d as number);
		};

		bus.on("event_a", h);
		bus.emit("event_a", 1);
		bus.off("event_a", h);
		bus.emit("event_a", 2); // should not be received
		bus.on("event_a", h);
		bus.emit("event_a", 3);

		expect(calls).toEqual([1, 3]);
	});

	test("independent buses do not share handlers", () => {
		const busA = new MessageBus<TestEvents>();
		const busB = new MessageBus<TestEvents>();
		const log: string[] = [];

		busA.on("event_a", () => void log.push("A"));
		busB.emit("event_a", {});

		expect(log).toEqual([]);
	});
});
