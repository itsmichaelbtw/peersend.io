import { useSyncExternalStore } from "react";
import { appState } from "@/state";
import { webSocketClient } from "@/lib/networking";
// import { WebRTCClient } from "@/lib/webrtc";

export function useAppState() {
  const state = useSyncExternalStore(
    appState.subscribe.bind(appState),
    appState.get.bind(appState),
    () => appState.get()
  );

  return {
    ...state,
    resetState() {
      webSocketClient.disconnect();
      // WebRTCClient.disconnect();
    }
  };
}
