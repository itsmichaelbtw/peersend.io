import type { PeerSendFile } from "@/state/types";

import { Badge, Box, Button, Card, Center, Group, Stack } from "@mantine/core";
import { DownloadIcon, SendIcon, Trash2Icon } from "lucide-react";
import { fileTransferState } from "@/state";
import { useFileTransferState } from "@/hooks/use-file-transfer-state";
import { initiateFileTransfer } from "@/lib/file-transfer";

import { FileUpload, FileTable } from "../file-transfer";

export function FileTransfer() {
  const { fileGroups } = useFileTransferState();

  async function onSend(files: PeerSendFile[]) {
    const pendingFiles = files.filter((f) => f.status === "pending");

    if (pendingFiles.length === 0) {
      return;
    }

    await initiateFileTransfer(pendingFiles);

    // do something here maybe a notif
    // if in transit you can't select the checkbox nor remove it until its done
    // maybe look at cancelling in the future?
  }

  return (
    <Stack>
      <Card shadow="sm" padding="sm" radius="sm" className="select-none" withBorder>
        <Card.Section py="sm" inheritPadding withBorder>
          <Group justify="space-between">
            <h2 className="font-semibold text-lg leading-snug">File Transfer</h2>

            <Badge radius="md" size="md" variant="light" color="gray">
              <span>500MB limit</span>
            </Badge>
          </Group>
        </Card.Section>

        <Card.Section py="sm" className="space-y-3" inheritPadding withBorder>
          <FileUpload />
          <FileTable files={fileGroups.outgoing}>
            {({ isUsingSelection, files }) => (
              <Group justify="space-between">
                <Box>
                  {isUsingSelection && (
                    <p className="text-sm text-gray-500">
                      {files.length} of {fileGroups.outgoing.length} selected
                    </p>
                  )}
                </Box>
                <Group gap="xs">
                  <Button
                    size="sm"
                    color="dark"
                    leftSection={<Trash2Icon size={16} />}
                    onClick={() => {
                      fileTransferState.remove(isUsingSelection ? files : fileGroups.outgoing);
                    }}
                  >
                    {isUsingSelection ? `Remove (${files.length})` : "Clear"}
                  </Button>
                  <Button
                    color="teal"
                    size="sm"
                    leftSection={<SendIcon size={16} />}
                    onClick={() => {
                      onSend(isUsingSelection ? files : fileGroups.outgoing);
                    }}
                  >
                    Send {isUsingSelection && `(${files.length})`}
                  </Button>
                </Group>
              </Group>
            )}
          </FileTable>
        </Card.Section>
      </Card>

      <Card shadow="sm" padding="sm" radius="sm" className="select-none" withBorder>
        <Card.Section py="sm" inheritPadding withBorder>
          <h2 className="font-semibold text-lg leading-snug">Shared Files</h2>
        </Card.Section>

        <Card.Section py="sm" inheritPadding withBorder>
          <FileTable
            files={fileGroups.incoming}
            emptyComponent={
              <Center p="xl">
                <p className="text-sm text-gray-500">Files sent by others will appear here</p>
              </Center>
            }
          >
            {({ isUsingSelection, files }) => (
              <Group justify="space-between">
                <Box>
                  {isUsingSelection && (
                    <p className="text-sm text-gray-500">
                      {files.length} of {fileGroups.incoming.length} selected
                    </p>
                  )}
                </Box>
                <Group gap="xs">
                  <Button
                    size="sm"
                    color="dark"
                    leftSection={<Trash2Icon size={16} />}
                    onClick={() => {
                      // fileTransferDispatch({
                      //   type: "REMOVE_FILES",
                      //   payload: {
                      //     files: files
                      //   }
                      // });
                    }}
                  >
                    {isUsingSelection ? `Remove (${files.length})` : "Clear"}
                  </Button>
                  <Button color="teal" size="sm" leftSection={<DownloadIcon size={16} />}>
                    Download {isUsingSelection && `(${files.length})`}
                  </Button>
                </Group>
              </Group>
            )}
          </FileTable>
        </Card.Section>
      </Card>
    </Stack>
  );
}
