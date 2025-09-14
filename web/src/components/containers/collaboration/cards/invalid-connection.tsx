import { Card, Center, Group, Stack } from "@mantine/core";
import { CloudAlertIcon } from "lucide-react";

export function InvalidConnection() {
  return (
    <Card shadow="sm" padding="sm" radius="sm" className="select-none" withBorder>
      <Card.Section py="sm" inheritPadding withBorder>
        <h2 className="font-semibold text-lg leading-snug">Uh Oh!</h2>
        <p className="text-black/50 leading-snug">Something went wrong</p>
      </Card.Section>

      <Card.Section py="sm" inheritPadding>
        <Center>
          <Group justify="center" gap="xl" className="pointer-events-auto max-w-sm" p="lg">
            <Stack gap={2} align="center">
              <div className="mb-2 flex p-4 items-center justify-center rounded-full bg-red-100">
                <CloudAlertIcon size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-medium">Invalid Connection</h3>
              <p className="text-sm text-gray-400 text-center leading-tight">
                There is a problem with this session
              </p>
            </Stack>
          </Group>
        </Center>
      </Card.Section>
    </Card>
  );
}
