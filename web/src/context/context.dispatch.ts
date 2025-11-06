import type { ContextReducerActions, ActionMap, DispatchState } from "./context.types";

/**
 * A function you pass to `withDispatchReducer` that calculates the next state
 * based on the current state and action.
 */
type DispatchFn<S extends DispatchState> = () => Partial<S>;

/**
 * Returns a reducer-like function that merges the state for DISPATCH
 * and falls back to running the provided function for all other actions.
 */
export function withDispatchReducer<M extends ActionMap, S extends DispatchState>(
	state: S,
	action: ContextReducerActions<M, S>
): (fn: DispatchFn<S>) => S {
	return (fn: DispatchFn<S>) => {
		if (action.type === "DISPATCH") {
			return {
				...state,
				...(action.payload as Partial<S>)
			};
		}

		return {
			...state,
			...fn()
		};
	};
}
