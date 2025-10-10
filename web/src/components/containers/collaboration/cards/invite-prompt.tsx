import { Card, Center, Group, Stack } from "@mantine/core";
import { UsersRoundIcon } from "lucide-react";

interface Props {
  clientsConnected: number;
  maximumClients: number;
}

export function InvitePromptCard({ clientsConnected, maximumClients }: Props) {
  return (
    <Card shadow="sm" padding="sm" radius="sm" className="select-none" withBorder>
      <Card.Section py="sm" inheritPadding withBorder>
        <h2 className="font-semibold text-lg leading-snug">
          Waiting for clients ({clientsConnected}/{maximumClients})
        </h2>
        <p className="text-black/50 leading-snug">
          More clients are required to establish a direct connection
        </p>
      </Card.Section>

      <Card.Section py="sm" inheritPadding>
        <Center>
          <Group justify="center" gap="xl" className="pointer-events-auto max-w-sm" p="lg">
            <Stack gap={2} align="center">
              <div className="mb-2 flex p-4 items-center justify-center rounded-full bg-gray-100">
                <UsersRoundIcon size={28} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium">Invite Users</h3>
              <p className="text-sm text-gray-400 text-center leading-tight">
                Share the session code to start a direct connection
              </p>
            </Stack>
          </Group>
        </Center>
      </Card.Section>
    </Card>
  );
}
