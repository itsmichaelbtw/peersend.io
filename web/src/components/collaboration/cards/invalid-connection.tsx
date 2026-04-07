import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CloudAlertIcon } from "lucide-react";

export function InvalidConnectionCard(): React.ReactNode {
	return (
		<Card className="select-none border-0 flex flex-col">
			<CardHeader className="border-b p-3 sm:p-4 md:p-6">
				<h2 className="font-semibold text-base md:text-lg leading-snug">Uh Oh!</h2>
				<p className="text-muted-foreground leading-snug">Something went wrong</p>
			</CardHeader>

			<CardContent className="flex flex-1 items-center justify-center p-3 sm:p-4 md:p-6">
				<div className="flex flex-col gap-0.5 items-center text-center max-w-sm">
					<div className="mb-2 flex p-4 items-center justify-center bg-red-100">
						<CloudAlertIcon size={28} className="text-red-500" />
					</div>
					<h3 className="text-base md:text-lg font-medium">Invalid Connection</h3>
					<p className="text-sm text-muted-foreground text-center leading-tight">
						There is a problem with this session
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
