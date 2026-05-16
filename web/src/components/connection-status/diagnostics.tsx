import React from "react";

import { useAppState } from "@/hooks/use-app-state";
import { useLatencyHistory } from "@/hooks/use-latency-history";
import { APP_VERSION } from "@/config/constants";
import { LatencyGraph } from "./latency-graph";

export function Diagnostics(): React.ReactNode {
	const { sessionState, webrtcState } = useAppState();
	const latencyHistory = useLatencyHistory();

	return (
		<div className="bg-secondary p-3 sm:p-4 md:p-6 select-none border-t">
			<h4 className="mb-2 text-sm font-medium">Session Diagnostics</h4>

			<div className="space-y-1">
				<div className="flex justify-between">
					<span className="text-xs text-muted-foreground">Protocol</span>
					<span className="text-xs font-medium font-mono">
						{sessionState.connectionType === "webrtc" ? "WebRTC" : "WebSocket"}
					</span>
				</div>

				{sessionState.connectionType === "webrtc" && webrtcState.dataChannel !== null && (
					<div className="flex justify-between">
						<span className="text-xs text-muted-foreground">Data Channel</span>
						<span className="text-xs font-medium font-mono">{webrtcState.dataChannel.label}</span>
					</div>
				)}

				{latencyHistory.length > 0 && (
					<div className="flex justify-between items-center h-4">
						<span className="text-xs text-muted-foreground">Latency</span>
						<LatencyGraph history={latencyHistory} />
					</div>
				)}

				{sessionState.sessionCode !== null && (
					<div className="flex justify-between">
						<span className="text-xs text-muted-foreground">Session code</span>
						<span className="text-xs font-medium font-mono">{sessionState.sessionCode}</span>
					</div>
				)}

				<div className="flex justify-between">
					<span className="text-xs text-muted-foreground">Version</span>
					<span className="text-xs font-medium font-mono">v{APP_VERSION}</span>
				</div>
			</div>
		</div>
	);
}
