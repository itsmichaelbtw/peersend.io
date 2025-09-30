import { Button, Card, Center, Group, Stack } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { ClockIcon } from "lucide-react";

export function InitiateDirectConnectionCard() {
  return (
    <Card shadow="sm" padding="sm" radius="sm" className="select-none" withBorder>
      <Card.Section py="sm" inheritPadding withBorder>
        <h2 className="font-semibold text-lg leading-snug">Establish Direct Connection</h2>
        <p className="text-black/50 leading-snug">
          File transfers require a peer-to-peer connection
        </p>
      </Card.Section>

      <Card.Section py="sm" inheritPadding>
        <Center>
          <Group justify="center" gap="xl" className="pointer-events-auto max-w-md" p="lg">
            <Stack gap={2} align="center">
              <div className="mb-2 flex p-4 items-center justify-center rounded-full bg-gray-100">
                <ClockIcon size={28} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium">Direct Connection Available</h3>
              <p className="text-sm text-gray-400 text-center leading-tight">
                Your session is full and ready for file transfers, but you first need to establish a
                direct connection.
              </p>

              <Button
                size="sm"
                className="mt-8"
                onClick={() => {
                  openContextModal({
                    modal: "initiateDirectConnection",
                    innerProps: {},
                    centered: true,
                    title: <span className="font-semibold text-lg">Direct Connection</span>,
                    size: "md"
                  });
                }}
              >
                Establish Connection
              </Button>
            </Stack>
          </Group>
        </Center>
      </Card.Section>
    </Card>
  );
}
