import { Stack, Card, Group, Center } from "@mantine/core";
import { ClockIcon } from "lucide-react";

export function HostStandby() {
  return (
    <Card shadow="sm" padding="sm" radius="sm" className="select-none" withBorder>
      <Card.Section py="sm" inheritPadding withBorder>
        <h2 className="font-semibold text-lg leading-snug">Standby</h2>
        <p className="text-black/50 leading-snug">Waiting for the host to begin the connection</p>
      </Card.Section>

      <Card.Section py="sm" inheritPadding>
        <Center>
          <Group justify="center" gap="xl" className="pointer-events-auto max-w-sm" p="lg">
            <Stack gap={2} align="center">
              <div className="mb-2 flex p-4 items-center justify-center rounded-full bg-gray-100">
                <ClockIcon size={28} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium">Pending Host Action</h3>
              <p className="text-sm text-gray-400 text-center leading-tight">
                Hang tight — the host will kick off the file transfer once they're ready
              </p>
            </Stack>
          </Group>
        </Center>
      </Card.Section>
    </Card>
  );
}
