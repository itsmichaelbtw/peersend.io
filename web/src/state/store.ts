import type { DispatchState, ActionMap, ContextReducerActions } from "@/context/context.types";

import { withDispatchReducer } from "@/context/context.dispatch";
import { createLogger } from "@/utils/logger";

const log = createLogger("StateStore");

type Listener<S extends DispatchState> = (state: S) => void;

export type StateUpdateFunction<S> = (previous: S) => S;

export abstract class StateStore<S extends DispatchState, M extends ActionMap> {
	private state: S;
	private listeners: Set<Listener<S>> = new Set();

	constructor(initialState: S) {
		this.state = initialState;
	}

	public get() {
		return this.state;
	}

	protected set(next: StateUpdateFunction<S>): void {
		const nextState = next(this.state);

		this.state = nextState;

		for (const listener of this.listeners) {
			listener(this.state);
		}
	}

	public subscribe(listener: Listener<S>) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	public dispatch<K extends keyof M>(type: K, data: K extends keyof M ? M[K] : Partial<S>): void {
		log.debug(`Dispatching action: ${String(type)}`, data);

		const payload = {
			type,
			payload: data
		} as ContextReducerActions<M, S>;

		this.set((current) =>
			withDispatchReducer(current, payload)(() => this.reducer(current, payload))
		);
	}

	protected abstract reducer(state: S, action: ContextReducerActions<M, S>): Partial<S>;
}
