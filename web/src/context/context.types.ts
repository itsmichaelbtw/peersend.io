import type { FlexibleString } from "@/types/misc";

export type ActionMap = Record<string, any>;
export type DispatchState = Record<string, any>;
export type DispatchType = "DISPATCH" | FlexibleString;

export interface ContextDispatchPayload<T extends DispatchType, P extends DispatchState> {
	type: T;
	payload: P;
}

export type ContextReducerActions<M extends ActionMap, S extends DispatchState> =
	| {
			[Type in keyof M & DispatchType]: ContextDispatchPayload<Type, M[Type]>;
	  }[keyof M & DispatchType]
	| ContextDispatchPayload<"DISPATCH", Partial<S>>;

export type InitialStateWithDispatch<
	M extends ActionMap,
	S extends DispatchState,
	Dispatcher extends string
> = {
	[key in Dispatcher]: React.Dispatch<ContextReducerActions<M, S>>;
} & S;
