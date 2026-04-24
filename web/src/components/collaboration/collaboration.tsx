import React from "react";

import { useAppState } from "@/hooks/use-app-state";

import {
	InvitePromptCard,
	HostStandbyCard,
	InitiateDirectConnectionCard,
	FileTransferCard,
	InvalidConnectionCard
} from "./cards";

export function Collaboration(): React.ReactNode {
	const { sessionState } = useAppState();

	if (sessionState.connectionType === "websocket") {
		if (sessionState.clients.length === sessionState.maximumClients) {
			return (
				<React.Fragment>
					{sessionState.isHost ? (
						<InitiateDirectConnectionCard />
					) : (
						<HostStandbyCard />
					)}
					<FileTransferCard />
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<InvitePromptCard
					clientsConnected={sessionState.clients.length}
					maximumClients={sessionState.maximumClients}
				/>
				<FileTransferCard />
			</React.Fragment>
		);
	}

	if (sessionState.connectionType === "webrtc") {
		return <FileTransferCard />;
	}

	return <InvalidConnectionCard />;
}
