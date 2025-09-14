import {
  FileTransferConsumer,
  FileTransferProvider,
  type PeerSendFile
} from "@/context/file-transfer";

import { Badge, Box, Button, Card, Center, Group, Stack } from "@mantine/core";
import { DownloadIcon, SendIcon, Trash2Icon } from "lucide-react";
import { FileUpload, FileTable } from "../file-transfer";
import { webrtcClient } from "@/lib/networking";
import { sleep } from "@/utils/sleep";

export function FileTransfer() {
  async function send(file: PeerSendFile) {
    const CHUNK_SIZE = 16 * 1024; // 16 KB per chunk, adjust based on performance

    async function* fileToChunks(file: File) {
      let offset = 0;
      while (offset < file.size) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const buffer = await chunk.arrayBuffer();
        yield buffer;
        offset += CHUNK_SIZE;
      }
    }

    let chunkIndex = 0;

    console.log(file);

    for await (const chunk of fileToChunks(file.file)) {
      const buffer = new Uint8Array(chunk);
      const c = Array.from(buffer);

      webrtcClient.emit({
        type: "file_transit",
        data: {
          byteLength: buffer.byteLength,
          totalSize: file.file.size,
          chunk: c
        }
      });

      chunkIndex++;

      await sleep(5);
    }

    console.log("Sent");
  }

  return (
    <FileTransferProvider>
      <FileTransferConsumer>
        {({ getIncomingFiles, getOutgoingFiles, fileTransferDispatch }) => (
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
                <FileTable files={getOutgoingFiles()}>
                  {({ isUsingSelection, files }) => (
                    <Group justify="space-between">
                      <Box>
                        {isUsingSelection && (
                          <p className="text-sm text-gray-500">
                            {files.length} of {getOutgoingFiles().length} selected
                          </p>
                        )}
                      </Box>
                      <Group gap="xs">
                        <Button
                          size="sm"
                          color="dark"
                          leftSection={<Trash2Icon size={16} />}
                          onClick={() => {
                            fileTransferDispatch({
                              type: "REMOVE_FILES",
                              payload: {
                                files: files
                              }
                            });
                          }}
                        >
                          {isUsingSelection ? `Remove (${files.length})` : "Clear"}
                        </Button>
                        <Button
                          color="teal"
                          size="sm"
                          leftSection={<SendIcon size={16} />}
                          onClick={() => {
                            send(getOutgoingFiles()[0]);
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
                  files={getIncomingFiles()}
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
                            {files.length} of {getOutgoingFiles().length} selected
                          </p>
                        )}
                      </Box>
                      <Group gap="xs">
                        <Button
                          size="sm"
                          color="dark"
                          leftSection={<Trash2Icon size={16} />}
                          onClick={() => {
                            fileTransferDispatch({
                              type: "REMOVE_FILES",
                              payload: {
                                files: files
                              }
                            });
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
        )}
      </FileTransferConsumer>
    </FileTransferProvider>
  );
}
