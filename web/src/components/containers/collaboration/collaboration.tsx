import { useAppState } from "@/hooks/use-app-state";

import {
	InvitePromptCard,
	HostStandbyCard,
	InitiateDirectConnectionCard,
	FileTransferCard,
	InvalidConnectionCard
} from "./cards";

export function Collaboration() {
	const { sessionState } = useAppState();

	if (sessionState.connectionType === "websocket") {
		if (sessionState.clients.length === sessionState.maximumClients) {
			if (sessionState.isHost) {
				return <InitiateDirectConnectionCard />;
			} else {
				return <HostStandbyCard />;
			}
		}

		return (
			<InvitePromptCard
				clientsConnected={sessionState.clients.length}
				maximumClients={sessionState.maximumClients}
			/>
		);
	}

	if (sessionState.connectionType === "webrtc") {
		return <FileTransferCard />;
	}

	return <InvalidConnectionCard />;
}
