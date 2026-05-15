import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClockIcon } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";

export function HostStandbyCard(): React.ReactNode {
	const { sessionState } = useAppState();

	return (
		<Card className="select-none border-0 flex flex-col">
			<CardHeader className="border-b p-3 sm:p-4 md:p-6">
				<h2 className="font-semibold text-base md:text-lg leading-snug">Standby</h2>
				<p className="text-muted-foreground leading-snug">
					{sessionState.autoWebRTC
						? "Connecting automatically"
						: "Waiting for the host to begin the connection"}
				</p>
			</CardHeader>

			<CardContent className="flex flex-1 items-center justify-center p-3 sm:p-4 md:p-6">
				<div className="flex flex-col gap-0.5 items-center text-center max-w-sm">
					{sessionState.autoWebRTC ? (
						<>
							<div className="mb-4 animate-spin rounded-full h-10 w-10 border-2 border-border border-t-foreground" />
							<h3 className="text-base md:text-lg font-medium">Connecting Automatically</h3>
							<p className="text-sm text-muted-foreground text-center leading-tight">
								The host is establishing a direct connection — this will only take a moment
							</p>
						</>
					) : (
						<>
							<div className="mb-2 flex p-4 items-center justify-center bg-secondary">
								<ClockIcon size={28} className="text-muted-foreground" />
							</div>
							<h3 className="text-base md:text-lg font-medium">Pending Host Action</h3>
							<p className="text-sm text-muted-foreground text-center leading-tight">
								Hang tight — the host will kick off the file transfer once they&#39;re ready
							</p>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
