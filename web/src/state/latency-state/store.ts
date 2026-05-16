import type { ContextReducerActions } from "@/context/context.types";

import { StateStore } from "../store";

interface LatencyState {
	history: number[];
}

interface StateActions {
	SET_HISTORY: number[];
	CLEAR: null;
}

export class LatencyStateStore extends StateStore<LatencyState, StateActions> {
	protected reducer(
		state: LatencyState,
		action: ContextReducerActions<StateActions, LatencyState>
	): Partial<LatencyState> {
		switch (action.type) {
			case "SET_HISTORY":
				return { history: action.payload };
			case "CLEAR":
				return { history: [] };
		}

		return state;
	}
}
