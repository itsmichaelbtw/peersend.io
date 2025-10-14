import type { WithNullable } from "@/types/misc";
import type { NetworkMessage, NetworkMessagePayload, NetworkEvents } from "./types";

import { MessageBus } from "./core/message-bus";
import { LatencyChecker } from "./core/latency-checker";
import { LatencyMonitor } from "./core/latency-monitor";
import { createLogger } from "@/utils/logger";

const log = createLogger("NetworkClient");

export abstract class NetworkClient<
	I extends NetworkMessagePayload<string, any>,
	O extends NetworkMessagePayload<string, any>
> extends LatencyMonitor {
	public message_bus: MessageBus<NetworkMessage.UnionType<I>>;

	protected latency_ping_interval: WithNullable<NodeJS.Timeout> = null;
	protected latency_ping_interval_ms: number = 1000;

	constructor(latency_checker: LatencyChecker) {
		super(latency_checker);
		this.message_bus = new MessageBus<NetworkMessage.UnionType<I>>();
	}

	public register_events(events: NetworkEvents<I>): this {
		const eventKeys = Object.keys(events) as Array<keyof NetworkEvents<I>>;
		log.info(`Registering ${eventKeys.length} event handlers`);
		for (let i = 0; i < eventKeys.length; i++) {
			const event = eventKeys[i];
			this.message_bus.on(event, events[event]);
		}
		return this;
	}

	public abstract connect(): Promise<void>;
	public abstract disconnect(): Promise<void>;
	public abstract reset(): void;
	public abstract emit(event: O): void;
}
