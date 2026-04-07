import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClockIcon } from "lucide-react";

export function HostStandbyCard(): React.ReactNode {
	return (
		<Card className="select-none border-0 flex flex-col">
			<CardHeader className="border-b p-3 sm:p-4 md:p-6">
				<h2 className="font-semibold text-base md:text-lg leading-snug">Standby</h2>
				<p className="text-muted-foreground leading-snug">
					Waiting for the host to begin the connection
				</p>
			</CardHeader>

			<CardContent className="flex flex-1 items-center justify-center p-3 sm:p-4 md:p-6">
				<div className="flex flex-col gap-0.5 items-center text-center max-w-sm">
					<div className="mb-2 flex p-4 items-center justify-center bg-secondary">
						<ClockIcon size={28} className="text-muted-foreground" />
					</div>
					<h3 className="text-base md:text-lg font-medium">Pending Host Action</h3>
					<p className="text-sm text-muted-foreground text-center leading-tight">
						Hang tight — the host will kick off the file transfer once they&#39;re ready
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
