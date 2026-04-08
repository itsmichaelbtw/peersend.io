import React, { useState } from "react";

import { LinkIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppState } from "@/hooks/use-app-state";
import { ConnectionStatus } from "@/components/connection-status";
import { Collaboration } from "@/components/collaboration";
import { SessionStatusBar } from "@/components/session-status-bar";
import { Seo } from "@/components/seo";

export function ActiveSessionView(): React.ReactNode {
	const { sessionState } = useAppState();
	const [showAlert, setShowAlert] = useState(true);

	if (!sessionState.isConnected || sessionState.connectionType === "none") {
		return (
			<Card className="select-none w-md border-x-0 sm:border-x">
				<Seo
					title="Active session"
					description="Live peer-to-peer file transfer session."
					noIndex
				/>
				<div className="border-b px-3 sm:px-4 md:px-6 py-3">
					<h2 className="font-semibold text-base md:text-lg">No Active Session</h2>
				</div>

				<div className="flex flex-col items-center justify-center py-16 px-3 sm:px-4 md:px-6 gap-6 text-center">
					<div className="flex p-4 bg-muted">
						<LinkIcon size={32} className="text-muted-foreground" />
					</div>
					<div className="space-y-1.5">
						<h2 className="font-semibold text-base md:text-lg">You are not connected</h2>
						<p className="text-sm text-muted-foreground max-w-xs">
							You need an active session to transfer files. Create a new session or join an existing
							one.
						</p>
					</div>
					<div className="flex items-center gap-0 border divide-x">
						<Link to="/session/create">
							<Button variant="ghost" size="sm" className="gap-1.5 px-4">
								Create session
							</Button>
						</Link>
						<Link to="/session/join">
							<Button variant="ghost" size="sm" className="gap-1.5 px-4">
								Join session
							</Button>
						</Link>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<div className="select-none w-full">
			<Seo
				title="Active session"
				description="Live peer-to-peer file transfer session."
				noIndex
			/>
			<div className="border border-b-0 border-x-0 sm:border-x bg-card">
				<SessionStatusBar />

				{showAlert && (
					<div className="border-b bg-yellow-50 px-3 sm:px-4 md:px-6 py-3 flex items-center justify-between gap-4 text-yellow-800 text-sm">
						<div className="flex items-center gap-2">
							<TriangleAlertIcon size={16} className="text-yellow-600 shrink-0" />
							<span>
								All received files will be lost when you close this tab or browser. Download any
								files you want to keep.
							</span>
						</div>
						<button
							type="button"
							onClick={() => setShowAlert(false)}
							className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
							aria-label="Dismiss"
						>
							<XIcon size={16} />
						</button>
					</div>
				)}

				<div className="h-8 w-full relative border-b">
					<div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_48%,var(--color-border)_48%,var(--color-border)_52%,transparent_52%)] bg-size-[20px_20px]" />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 divide-x">
				<div className="md:col-span-1">
					<div className="bg-card border-x-0 border-b border-l border-r-0">
						<ConnectionStatus />
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="bg-card border-x-0 border-b border-r border-l-0">
						<Collaboration />
					</div>
				</div>
			</div>
		</div>
	);
}
