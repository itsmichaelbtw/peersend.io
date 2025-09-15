import type { RecursivePartial } from "@/types/misc";

type State = Record<string, any>;
type Listener<T extends State> = (state: T) => void;

export type StateUpdate<T> = RecursivePartial<T>;
export type StateUpdateFunction<T> = (current: T, state: StateUpdate<T>) => void;

export abstract class StateStore<T extends State> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  public get() {
    return this.state;
  }

  public set(newState: RecursivePartial<T>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: Listener<T>) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public abstract update(state: RecursivePartial<T>): void;
}

export function createStateStore<S extends StateStore<T>, T extends State>(
  Store: new (initialState: T) => S,
  initialState: T
) {
  return new Store(initialState);
}
