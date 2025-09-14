import { useAppState } from "@/hooks/use-app-state";
import { Box } from "@mantine/core";

export function Diagnostics() {
  const { sessionState, webrtcState } = useAppState();

  return (
    <Box className="relative rounded-md p-2.5 select-none bg-gray-100">
      <h4 className="mb-2 text-sm font-medium">Session Diagnostics</h4>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Protocol</span>
          <span className="text-xs font-medium font-mono">
            {sessionState.connectionType === "webrtc" ? "WebRTC" : "WebSocket"}
          </span>
        </div>

        {sessionState.connectionType === "webrtc" && webrtcState.dataChannel != null && (
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Data Channel</span>
            <span className="text-xs font-medium font-mono">
              {webrtcState.dataChannel._channel.label}
            </span>
          </div>
        )}

        {sessionState.latency > -1 && (
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Latency</span>
            <span className="text-xs font-medium font-mono">{sessionState.latency}ms</span>
          </div>
        )}

        {sessionState.sessionCode != null && (
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Session code</span>
            <span className="text-xs font-medium font-mono">{sessionState.sessionCode}</span>
          </div>
        )}
      </div>
    </Box>
  );
}
