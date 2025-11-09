import type { ConnectionErrorData } from "@/state/types";

import React, { useEffect } from "react";

import { Outlet } from "react-router";
import { UsersRoundIcon, CrownIcon } from "lucide-react";

import { Badge } from "@mantine/core";
import { appState } from "@/state";
import { notifications } from "@mantine/notifications";
import { useAppState } from "@/hooks/use-app-state";
import { capitalise } from "@/utils/capitalise";

export function SessionLayout(): React.ReactNode {
	const { sessionState } = useAppState();

	function handleLastError(lastError: ConnectionErrorData): void {
		appState.dispatch("SET_LAST_ERROR", null);

		notifications.show({
			id: lastError.title,
			title: lastError.title,
			message: capitalise(lastError.message),
			color: "red",
			withBorder: true,
			position: "top-right"
		});
	}

	useEffect(() => {
		if (sessionState.lastError) {
			handleLastError(sessionState.lastError);
		}
	}, [sessionState.lastError]);

	return (
		<React.Fragment>
			<header className="border-b border-gray-200 bg-white fixed top-0 w-full h-16 z-10">
				<div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
					<div>peersend.io</div>

					{sessionState.sessionCode && sessionState.isConnected ? (
						<div className="select-none">
							<div className="flex items-center justify-center gap-x-2">
								{sessionState.isHost && (
									<Badge
										size="lg"
										variant="light"
										color="gray"
										radius="md"
										leftSection={<CrownIcon size={16} />}
									>
										<span className="inline-block align-middle">Host</span>
									</Badge>
								)}

								<Badge
									size="lg"
									variant="light"
									color="gray"
									radius="md"
									leftSection={<UsersRoundIcon size={16} />}
								>
									<span className="inline-block align-middle space-x-1">
										<span>
											{sessionState.clients.length}/{sessionState.maximumClients}
										</span>
										<span>Connected</span>
									</span>
								</Badge>
							</div>
						</div>
					) : null}
				</div>
			</header>
			<main className="mx-auto min-h-dvh z-0 pt-48 bg-gray-50">
				<div className="flex flex-col items-center justify-start max-w-6xl gap-4 mx-auto">
					<Outlet />
				</div>
			</main>
		</React.Fragment>
	);
}
