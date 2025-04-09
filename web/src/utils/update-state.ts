export function keyMatchStateUpdate<
  State extends Record<string, any>,
  Incoming extends Record<string, any>
>(state: State, incoming: Incoming, keys: (keyof State)[]): void {
  for (const key of keys) {
    if (incoming.hasOwnProperty(key) && state.hasOwnProperty(key)) {
      const newValue = incoming[key as keyof Incoming];

      if (newValue == null) {
        continue;
      }

      state[key] = newValue;
    }
  }
}
