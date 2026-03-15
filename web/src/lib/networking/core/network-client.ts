import type { NetworkMessageUnionType, NetworkMessagePayload, NetworkEvents } from "../types";

import { MessageBus } from "./message-bus";
import { LatencyTracker } from "./latency-tracker";
import type { PongData } from "./latency-tracker";
import { createLogger } from "@/utils/logger";

const log = createLogger("NetworkClient");

export abstract class NetworkClient<
	I extends NetworkMessagePayload<string, unknown>,
	O extends NetworkMessagePayload<string, unknown>,
	S = void
> {
	public readonly messageBus: MessageBus<NetworkMessageUnionType<I>, S>;
	protected readonly tracker: LatencyTracker;

	constructor(tracker: LatencyTracker) {
		this.messageBus = new MessageBus<NetworkMessageUnionType<I>, S>();
		this.tracker = tracker;
	}

	public startLatencyMonitoring(): void {
		this.tracker.start();
	}

	public stopLatencyMonitoring(): void {
		this.tracker.stop();
	}

	public pong(data: PongData): void {
		this.tracker.pong(data);
	}

	public registerEvents(events: NetworkEvents<I, S>): this {
		const eventKeys = Object.keys(events) as Array<keyof NetworkEvents<I, S>>;
		log.info(`Registering ${eventKeys.length} event handlers`);
		for (let i = 0; i < eventKeys.length; i++) {
			const event = eventKeys[i];
			this.messageBus.on(event, events[event]);
		}
		return this;
	}

	public abstract connect(...args: unknown[]): Promise<this>;
	public abstract disconnect(): this;
	public abstract reset(): this;
	public abstract emit(event: O): this;
}
