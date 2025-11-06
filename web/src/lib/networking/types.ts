import type { MessageBusHandler } from "./core/message-bus";

export interface NetworkMessagePayload<T extends string, D = unknown> {
	type: T;
	data: D;
}

export type NetworkMessageUnionType<M extends NetworkMessagePayload<string, unknown>> = M["type"];
export type NetworkMessageUnionData<M extends NetworkMessagePayload<string, unknown>> = M["data"];

export type NetworkDataForType<
	M extends NetworkMessagePayload<string, unknown>,
	T extends M["type"]
> = Extract<M, { type: T }>["data"];

export type NetworkEvents<I extends NetworkMessagePayload<string, unknown>> = {
	[T in I["type"]]: MessageBusHandler<NetworkDataForType<I, T>>;
};
