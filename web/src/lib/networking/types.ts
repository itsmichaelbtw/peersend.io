import type { MessageBusHandler } from "./core/message-bus";

export interface NetworkMessagePayload<T extends string, D = any> {
  type: T;
  data: D;
}

export namespace NetworkMessage {
  export type UnionType<M extends NetworkMessagePayload<string, any>> = M["type"];
  export type UnionData<M extends NetworkMessagePayload<string, any>> = M["data"];
}

export type NetworkDataForType<
  M extends NetworkMessagePayload<string, any>,
  T extends M["type"]
> = Extract<M, { type: T }>["data"];

export type NetworkEvents<I extends NetworkMessagePayload<string, any>> = {
  [T in I["type"]]: MessageBusHandler<NetworkDataForType<I, T>>;
};
