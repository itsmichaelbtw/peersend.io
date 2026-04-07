import React, { useState } from "react";

import { CrownIcon, RouterIcon, WifiIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { useAppState } from "@/hooks/use-app-state";
import { getWebSocketClient } from "@/lib/networking/client-registry";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function SessionStatusBar(): React.ReactNode {
	const { sessionState } = useAppState();
	const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

	return (
		<React.Fragment>
			<div className="border-b flex flex-wrap items-stretch justify-between min-h-12">
				<div className="flex items-stretch">
					{sessionState.sessionCode !== null && (
						<div className="border-r">
							<CopyButton
								value={sessionState.sessionCode}
								className="h-full font-mono text-sm px-3 sm:px-4 md:px-6"
							>
								{sessionState.sessionCode}
							</CopyButton>
						</div>
					)}
					<div className="flex flex-wrap items-center sm:px-4 md:px-6 px-3">
						{sessionState.connectionType === "websocket" && (
							<Badge variant="secondary" className="gap-1 px-2 py-1">
								<WifiIcon size={14} />
								<span className="hidden sm:inline font-medium">Server Connection</span>
								<span className="sm:hidden font-medium">Server</span>
							</Badge>
						)}
						{sessionState.connectionType === "webrtc" && (
							<Badge className="gap-1 px-2 py-1">
								<RouterIcon size={14} />
								<span className="hidden sm:inline font-medium">Direct Connection</span>
								<span className="sm:hidden font-medium">Direct</span>
							</Badge>
						)}
						{sessionState.isHost && (
							<Badge variant="secondary" className="gap-1 px-2 py-1">
								<CrownIcon size={14} />
								<span className="font-medium">Host</span>
							</Badge>
						)}
					</div>
				</div>

				<div className="flex items-stretch">
					{sessionState.isHost && sessionState.clients.length > 1 && (
						<div className="border-l">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										className="h-full"
										onClick={() => {
											const ws = getWebSocketClient();
											ws.emit({ type: "transfer_host", data: null });
										}}
									>
										<CrownIcon size={16} />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Transfer host</p>
								</TooltipContent>
							</Tooltip>
						</div>
					)}
					<div className="border-l">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									className="h-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
									onClick={() => setLeaveDialogOpen(true)}
								>
									<XIcon size={16} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Leave session</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</div>

			<Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen} modal>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Leave Session</DialogTitle>
						<DialogDescription>Are you sure you want to leave this session?</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
							No
						</Button>
						<Button variant="destructive" onClick={() => window.location.reload()}>
							Yes, leave this session
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</React.Fragment>
	);
}
