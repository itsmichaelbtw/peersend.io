import type { ConnectionErrorData } from "@/state/types";

import React, { useEffect } from "react";

import { Outlet } from "react-router";
import { toast } from "sonner";
import { appState } from "@/state";
import { useAppState } from "@/hooks/use-app-state";
import { capitalise } from "@/utils/capitalise";
import { getWebRTCClient, getWebSocketClient } from "@/lib/networking/client-registry";

export function SessionLayout(): React.ReactNode {
	const { sessionState } = useAppState();

	function handleLastError(lastError: ConnectionErrorData): void {
		appState.dispatch("SET_LAST_ERROR", null);
		toast.error(lastError.title, {
			id: lastError.title,
			description: capitalise(lastError.message),
			position: "top-right"
		});
	}

	useEffect(() => {
		if (sessionState.lastError) {
			handleLastError(sessionState.lastError);
		}
	}, [sessionState.lastError]);

	useEffect(() => {
		return (): void => {
			getWebRTCClient().disconnect();
			getWebSocketClient().disconnect();
		};
	}, []);

	return (
		<React.Fragment>
			{/* {appState.get().sessionState.isConnected && (
				<header className="border-b border-border bg-background fixed top-0 w-full h-16 z-10">
					<div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
						<div>peersend.io</div>

						{sessionState.sessionCode && sessionState.isConnected ? (
							<div className="select-none">
								<div className="flex items-center justify-center gap-x-2">
									{sessionState.isHost && (
										<Badge variant="secondary" className="gap-1 px-2 py-1 text-sm">
											<CrownIcon size={16} />
											<span>Host</span>
										</Badge>
									)}

									<Badge variant="secondary" className="gap-1 px-2 py-1 text-sm">
										<UsersRoundIcon size={16} />
										<span>
											{sessionState.clients.length}/{sessionState.maximumClients}
										</span>
										<span>Connected</span>
									</Badge>
								</div>
							</div>
						) : null}
					</div>
				</header>
			)} */}
			<main className="mx-auto z-0 bg-secondary/30">
				<div className="min-h-screen w-full relative">
					<div
						className="absolute inset-0 z-0"
						style={{
							backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
							backgroundSize: "20px 20px",
							backgroundPosition: "0 0, 0 0",
							maskImage: `
        repeating-linear-gradient(
          to right,
          black 0px,
          black 3px,
          transparent 3px,
          transparent 8px
        ),
        repeating-linear-gradient(
          to bottom,
          black 0px,
          black 3px,
          transparent 3px,
          transparent 8px
        )
      `,
							WebkitMaskImage: `
        repeating-linear-gradient(
          to right,
          black 0px,
          black 3px,
          transparent 3px,
          transparent 8px
        ),
        repeating-linear-gradient(
          to bottom,
          black 0px,
          black 3px,
          transparent 3px,
          transparent 8px
        )
      `,
							maskComposite: "intersect",
							WebkitMaskComposite: "source-in"
						}}
					/>
					<div className="min-h-screen flex flex-col items-center justify-center max-w-6xl gap-4 mx-auto sm:py-12 py-6 sm:px-6 relative">
						<Outlet />
					</div>
				</div>
			</main>
		</React.Fragment>
	);
}
