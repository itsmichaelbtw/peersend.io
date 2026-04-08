import React from "react";

import { useAppState } from "@/hooks/use-app-state";
import { APP_VERSION } from "@/config/constants";

export function Diagnostics(): React.ReactNode {
	const { sessionState, webrtcState } = useAppState();

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

				{sessionState.latency > -1 && (
					<div className="flex justify-between">
						<span className="text-xs text-muted-foreground">Latency</span>
						<span className="text-xs font-medium font-mono">{sessionState.latency}ms</span>
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
