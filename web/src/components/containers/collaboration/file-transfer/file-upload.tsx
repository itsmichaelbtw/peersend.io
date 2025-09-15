import type { FileWithPath, FileRejection } from "@mantine/dropzone";
import type { PeerSendFile } from "@/state";

import { UploadIcon } from "lucide-react";
import { Dropzone } from "@mantine/dropzone";
import { Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fileTransferState } from "@/state";
import { createCustomFile } from "./utils";

export function FileUpload() {
  async function onDrop(files: FileWithPath[]) {
    const customFiles: PeerSendFile[] = [];

    for (const file of files) {
      const customFile = await createCustomFile(file, "outgoing");
      customFiles.push(customFile);
    }

    fileTransferState.add({
      files: customFiles
    });
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
  );
}
