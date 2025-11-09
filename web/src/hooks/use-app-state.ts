import type { AppState } from "@/state";

import { useSyncExternalStore } from "react";
import { appState } from "@/state";
import { getWebRTCClient, getWebSocketClient } from "@/lib/networking/utils";

interface UseAppState extends AppState {
	resetState(): void;
}

export function useAppState(): UseAppState {
	const state = useSyncExternalStore(
		appState.subscribe.bind(appState),
		appState.get.bind(appState),
		() => appState.get()
	);

	function resetState(): void {
		getWebSocketClient().disconnect();
		getWebRTCClient().disconnect();
	}

	return {
		...state,
		resetState: resetState
	};
}
