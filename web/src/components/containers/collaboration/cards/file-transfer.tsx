import type { FileWithPath, FileRejection } from "@mantine/dropzone";
import type { PeerSendFile } from "@/state/types";

import { DownloadIcon, SendIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Badge, Box, Button, Card, Center, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Dropzone } from "@mantine/dropzone";
import { useFileTransferState } from "@/hooks/use-file-transfer-state";
import {
  FileTransfer,
  WebRtcTransport,
  createCustomFileFromUpload,
  smartFileDownload
} from "@/lib/file-transfer";
import { webrtcClient } from "@/lib/networking";
import { appState, fileTransferState } from "@/state";

import { FileTable } from "../file-table";

export function FileTransferCard() {
  const { fileGroups } = useFileTransferState();

  async function onSend(files: PeerSendFile[]) {
    const filesToSend = files.filter((f) => f.status === "pending");

    if (filesToSend.length === 0) {
      return;
    }

    const { webrtcState } = appState.get();

    fileTransferState.dispatch(
      "BULK_UPDATE_FILES",
      filesToSend.map((file) => ({
        ...file,
        status: "in-transit"
      }))
    );

    const transport = new WebRtcTransport(webrtcClient, webrtcState.dataChannel!.getDataChannel());
    const fileTransfer = new FileTransfer(filesToSend, transport);

    await fileTransfer.initiate();

    // do something here maybe a notif
    // if in transit you can't select the checkbox nor remove it until its done
    // maybe look at cancelling in the future?
  }

  async function onDownload(files: PeerSendFile[]) {
    await smartFileDownload(files);
  }

  async function onDrop(files: FileWithPath[]) {
    const customFiles: PeerSendFile[] = [];

    for (const file of files) {
      const customFile = await createCustomFileFromUpload(file);
      customFiles.push(customFile);
    }

    fileTransferState.add(customFiles);
  }

  // need to verify this
  function onReject(rejections: FileRejection[]) {
    for (const rejection of rejections) {
      notifications.show({
        title: `File Upload Error: ${rejection.file.name}`,
        message: rejection.errors.join(", "),
        color: "red",
        withBorder: true
      });
    }
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
          <Dropzone onDrop={onDrop} onReject={onReject}>
            <Group justify="center" gap="xl" className="pointer-events-auto" p="lg">
              <Stack gap={0} align="center">
                <div className="mb-2 flex p-3 items-center justify-center rounded-full bg-gray-100">
                  <UploadIcon size={24} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium">Drag & Drop files</h3>
                <p className="text-sm text-gray-400">or click to browse from your computer</p>
              </Stack>
            </Group>
          </Dropzone>
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

        <Card.Section py="sm" className="space-y-3" inheritPadding withBorder>
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
                      fileTransferState.remove(isUsingSelection ? files : fileGroups.incoming);
                    }}
                  >
                    {isUsingSelection ? `Remove (${files.length})` : "Clear"}
                  </Button>
                  <Button
                    color="teal"
                    size="sm"
                    leftSection={<DownloadIcon size={16} />}
                    onClick={() => {
                      onDownload(isUsingSelection ? files : fileGroups.incoming);
                    }}
                  >
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
