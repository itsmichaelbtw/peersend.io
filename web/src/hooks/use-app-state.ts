import type { AppState } from "@/state";

import { useSyncExternalStore } from "react";
import { appState } from "@/state";
import { getWebRTCClient, getWebSocketClient } from "@/lib/networking/client-registry";

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
		const ws = getWebSocketClient();
		const rtc = getWebRTCClient();
		ws.disconnect();
		rtc.disconnect();
	}

	return {
		...state,
		resetState: resetState
	};
}
