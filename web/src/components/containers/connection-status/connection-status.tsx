import { Button, Card } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useAppState } from "@/hooks/use-app-state";
import { useClsx } from "@/hooks/use-clsx";
import { ZapIcon } from "lucide-react";

import { InfoStatistic } from "./info-statistic";
import { ClientIndicator } from "./client-indicator";
import { Diagnostics } from "./diagnostics";

export function ConnectionStatus() {
  const { sessionState } = useAppState();
  const { classNames, joinCls } = useClsx({
    icon: {
      "bg-[var(--mantine-color-teal-filled)]/45 text-[var(--mantine-color-teal-9)]":
        sessionState.connectionType === "webrtc",
      "bg-gray-200": sessionState.connectionType === "websocket"
    }
  });

  function onLeave() {
    modals.openConfirmModal({
      title: <span className="font-semibold text-lg">Leave Session</span>,
      children: <span className="text-gray-500">Are you sure you want to leave this session?</span>,
      labels: {
        cancel: "No",
        confirm: "Yes, leave this session"
      },
      size: "sm",
      confirmProps: { color: "red" },
      centered: true,
      onConfirm() {
        window.location.reload();
      }
    });
  }

  return (
    <Card shadow="sm" padding="sm" radius="sm" className="select-none" withBorder>
      <Card.Section py="sm" inheritPadding withBorder>
        <h1 className="font-semibold text-lg leading-snug">Connection Status</h1>
      </Card.Section>

      <Card.Section py="sm" className="space-y-2" inheritPadding>
        <InfoStatistic
          title="Connection type"
          stat={
            <div>
              <p className="inline-block align-middle">
                {sessionState.connectionType === "websocket" ? "WebSocket" : "WebRTC"}
              </p>
              <div className="relative ml-2 inline-flex items-center justify-center align-middle">
                {sessionState.connectionType === "webrtc" && (
                  <span className="bg-[var(--mantine-color-teal-filled)]/35 absolute h-8 w-8 animate-ping rounded-full"></span>
                )}

                <span
                  className={joinCls(
                    "relative flex h-6 w-6 items-center justify-center rounded-full",
                    classNames.icon
                  )}
                >
                  <ZapIcon size={14} />
                </span>
              </div>
            </div>
          }
        />
        <InfoStatistic title="Role" stat={sessionState.isHost ? "Host" : "Guest"} />
        <InfoStatistic
          title="Auto WebRTC"
          stat={
            sessionState.autoWebRTC ? (
              <span className="text-[var(--mantine-color-teal-7)] font-semibold">Enabled</span>
            ) : (
              <span className="text-[var(--mantine-color-red-7)] font-semibold">Disabled</span>
            )
          }
        />
        <InfoStatistic
          title="Encryption"
          stat={
            sessionState.encryptionMode !== "none" ? (
              <span className="text-[var(--mantine-color-teal-7)] font-semibold">
                {sessionState.encryptionMode}
              </span>
            ) : (
              <span className="text-[var(--mantine-color-red-7)] font-semibold">Disabled</span>
            )
          }
        />

        <ClientIndicator
          clientsConnected={sessionState.clients.length}
          maximumClients={sessionState.maximumClients}
        />

        <Diagnostics />

        <Button fullWidth size="sm" color="red" variant="filled" onClick={onLeave}>
          Leave session
        </Button>
      </Card.Section>
    </Card>
  );
}
