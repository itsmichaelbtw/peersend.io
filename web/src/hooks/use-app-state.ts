import { useSyncExternalStore } from "react";
import { appState } from "@/state";
import { getWebRTCClient, getWebSocketClient } from "@/lib/networking/utils";

export function useAppState() {
	const state = useSyncExternalStore(
		appState.subscribe.bind(appState),
		appState.get.bind(appState),
		() => appState.get()
	);

	return {
		...state,
		resetState() {
			getWebSocketClient().disconnect();
			getWebRTCClient().disconnect();
		}
	};
}
