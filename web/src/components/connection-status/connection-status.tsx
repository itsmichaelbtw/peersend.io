import React from "react";

import { useAppState } from "@/hooks/use-app-state";
import { isAppFeatureEnabled } from "@/state";
import { cn } from "@/lib/utils";
import { ZapIcon } from "lucide-react";

import { InfoStatistic } from "./info-statistic";
import { ClientIndicator } from "./client-indicator";
import { Diagnostics } from "./diagnostics";

export function ConnectionStatus(): React.ReactNode {
	const { sessionState } = useAppState();

	const iconClass = cn(
		"relative flex h-6 w-6 items-center justify-center",
		sessionState.connectionType === "webrtc"
			? "bg-primary bg-primary/20 text-primary"
			: "bg-secondary text-muted-foreground"
	);

	return (
		<div className="h-full flex flex-col">
			<div className="border-b p-3 sm:p-4 md:p-6">
				<h2 className="font-semibold text-base md:text-lg leading-snug">Connection Status</h2>
			</div>

			<div className="p-3 sm:p-4 md:p-6 flex flex-col gap-3">
				<InfoStatistic
					title="Connection type"
					stat={
						<div>
							<p className="inline-block align-middle">
								{sessionState.connectionType === "websocket" ? "WebSocket" : "WebRTC"}
							</p>
							<div className="relative ml-2 inline-flex items-center justify-center align-middle">
								{sessionState.connectionType === "webrtc" && (
									<span className="absolute bg-primary/35 h-8 w-8 animate-ping" />
								)}
								<span className={iconClass}>
									<ZapIcon size={14} />
								</span>
							</div>
						</div>
					}
				/>
				<InfoStatistic title="Role" stat={sessionState.isHost ? "Host" : "Guest"} />
				<InfoStatistic
					title="Auto WebRTC"
					stat={
						isAppFeatureEnabled("auto_webrtc") ? (
							<span className="text-primary font-semibold">Enabled</span>
						) : (
							<span className="text-destructive font-semibold">Disabled</span>
						)
					}
				/>
				<InfoStatistic
					title="Encryption"
					stat={
						isAppFeatureEnabled("encryption_mode") ? (
							<span className="text-primary font-semibold">{sessionState.encryptionMode}</span>
						) : (
							<span className="text-destructive font-semibold">Disabled</span>
						)
					}
				/>

				<ClientIndicator
					clientsConnected={sessionState.clients.length}
					maximumClients={sessionState.maximumClients}
				/>
			</div>

			<Diagnostics />
		</div>
	);
}
