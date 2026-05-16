import { useSyncExternalStore } from "react";
import { latencyState } from "@/state";

export function useLatencyHistory(): number[] {
	return useSyncExternalStore(
		latencyState.subscribe.bind(latencyState),
		() => latencyState.get().history,
		() => latencyState.get().history
	);
}
