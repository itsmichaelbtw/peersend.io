export type ActionMap = Record<string, any>;
export type DispatchState = Record<string, any>;

export interface ContextDispatchPayload<T extends string, P extends DispatchState> {
  type: T;
  payload: P;
}

export type ContextReducerActions<M extends ActionMap, S extends DispatchState> =
  | {
      [Type in keyof M & string]: ContextDispatchPayload<Type, M[Type]>;
    }[keyof M & string]
  | ContextDispatchPayload<"DISPATCH", Partial<S>>;

export type InitialStateWithDispatch<
  M extends ActionMap,
  S extends DispatchState,
  Dispatcher extends string
> = {
  [key in Dispatcher]: React.Dispatch<ContextReducerActions<M, S>>;
} & S;
