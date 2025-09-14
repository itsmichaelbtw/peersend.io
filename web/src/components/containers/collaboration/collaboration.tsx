import { useAppState } from "@/hooks/use-app-state";

import {
  InvitePrompt,
  HostStandby,
  InitiateDirectConnection,
  FileTransfer,
  InvalidConnection
} from "./cards";

export function Collaboration() {
  const { sessionState } = useAppState();

  if (sessionState.connectionType === "websocket") {
    if (sessionState.clients.length === sessionState.maximumClients) {
      if (sessionState.isHost) {
        return <InitiateDirectConnection />;
      } else {
        return <HostStandby />;
      }
    }

    return (
      <InvitePrompt
        clientsConnected={sessionState.clients.length}
        maximumClients={sessionState.maximumClients}
      />
    );
  }

  if (sessionState.connectionType === "webrtc") {
    return <FileTransfer />;
  }

  return <InvalidConnection />;
}
