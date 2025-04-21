import { applicationState } from "@/state/application";

export function useApplicationState() {
  return {
    websocketState: applicationState.__protocol.websocket,
    webrtcState: applicationState.__protocol.rtc
  };
}
