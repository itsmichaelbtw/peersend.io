import React, { useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClockIcon } from "lucide-react";
import { ConnectionUpgrade } from "@/components/collaboration/connection-upgrade";

export function InitiateDirectConnectionCard(): React.ReactNode {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<Card className="select-none border-0 flex flex-col">
			<CardHeader className="border-b p-3 sm:p-4 md:p-6">
				<h2 className="font-semibold text-base md:text-lg leading-snug">
					Establish Direct Connection
				</h2>
				<p className="text-muted-foreground leading-snug">
					File transfers require a peer-to-peer connection
				</p>
			</CardHeader>

			<CardContent className="flex flex-1 items-center justify-center p-3 sm:p-4 md:p-6">
				<div className="flex flex-col gap-0.5 items-center text-center max-w-md">
					<div className="mb-2 flex p-4 items-center justify-center bg-secondary">
						<ClockIcon size={28} className="text-muted-foreground" />
					</div>
					<h3 className="text-base md:text-lg font-medium">Direct Connection Available</h3>
					<p className="text-sm text-muted-foreground text-center leading-tight">
						Your session is full and ready for file transfers, but you first need to establish a
						direct connection.
					</p>

					<Button size="sm" className="mt-8" onClick={() => setDialogOpen(true)}>
						Establish Connection
					</Button>
				</div>
			</CardContent>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Direct Connection</DialogTitle>
					</DialogHeader>
					<ConnectionUpgrade onClose={() => setDialogOpen(false)} />
				</DialogContent>
			</Dialog>
		</Card>
	);
}
