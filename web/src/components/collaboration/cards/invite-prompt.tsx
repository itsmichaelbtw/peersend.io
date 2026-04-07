import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UsersRoundIcon } from "lucide-react";

interface Props {
	clientsConnected: number;
	maximumClients: number;
}

export function InvitePromptCard({ clientsConnected, maximumClients }: Props): React.ReactNode {
	return (
		<Card className="select-none border-0 flex flex-col">
			<CardHeader className="border-b p-3 sm:p-4 md:p-6">
				<h2 className="font-semibold text-base md:text-lg leading-snug">
					Waiting for clients ({clientsConnected}/{maximumClients})
				</h2>
				<p className="text-muted-foreground leading-snug">
					More clients are required to establish a direct connection
				</p>
			</CardHeader>

			<CardContent className="flex flex-1 items-center justify-center p-3 sm:p-4 md:p-6">
				<div className="flex flex-col gap-0.5 items-center text-center max-w-sm">
					<div className="mb-2 flex p-4 items-center justify-center bg-secondary">
						<UsersRoundIcon size={28} className="text-muted-foreground" />
					</div>
					<h3 className="text-base md:text-lg font-medium">Invite Users</h3>
					<p className="text-sm text-muted-foreground text-center leading-tight">
						Share the session code to start a direct connection
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
