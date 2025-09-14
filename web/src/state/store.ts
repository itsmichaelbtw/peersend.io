import type { RecursivePartial } from "@/types/misc";

type Listener<T> = (state: T) => void;

export type StateUpdate<T> = RecursivePartial<T>;

class StateStore<T> {
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
}

export function createStateStore<T>(initialState: T) {
  return new StateStore<T>(initialState);
}
