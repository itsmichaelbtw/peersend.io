import type { NetworkMessageUnionType, NetworkMessagePayload, NetworkEvents } from "./types";

import { MessageBus } from "./core/message-bus";
import { LatencyChecker } from "./core/latency-checker";
import { LatencyMonitor } from "./core/latency-monitor";
import { createLogger } from "@/utils/logger";

const log = createLogger("NetworkClient");

export abstract class NetworkClient<
	I extends NetworkMessagePayload<string, unknown>,
	O extends NetworkMessagePayload<string, unknown>
> extends LatencyMonitor {
	public messageBus: MessageBus<NetworkMessageUnionType<I>>;

	constructor(latency_checker: LatencyChecker) {
		super(latency_checker);
		this.messageBus = new MessageBus<NetworkMessageUnionType<I>>();
	}

	public registerEvents(events: NetworkEvents<I>): this {
		const eventKeys = Object.keys(events) as Array<keyof NetworkEvents<I>>;
		log.info(`Registering ${eventKeys.length} event handlers`);
		for (let i = 0; i < eventKeys.length; i++) {
			const event = eventKeys[i];
			this.messageBus.on(event, events[event]);
		}
		return this;
	}

	public abstract connect(): Promise<this>;
	public abstract disconnect(): this;
	public abstract reset(): this;
	public abstract emit(event: O): this;
}
