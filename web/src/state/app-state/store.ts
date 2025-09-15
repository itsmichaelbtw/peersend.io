import type { AppState } from "../types";
import type { RecursivePartial } from "@/types/misc";

import { StateStore } from "../store";

export class AppStateStore extends StateStore<AppState> {
  public update(state: RecursivePartial<AppState>): void {
    const current = this.get();
    const next: AppState = { ...current };

    for (const key in state) {
      if (state.hasOwnProperty(key)) {
        // @ts-ignore
        next[key] = { ...current[key], ...state[key] };
      }
    }

    this.set(next);
  }
}
