import type { FileTransferState } from "../types";
import type { RecursivePartial } from "@/types/misc";

import { StateStore } from "../store";
import { isArray, isObject } from "@/utils/is-x";
import { fileBytesStore } from "@/lib/file-transfer";

export class FileTransferStore extends StateStore<FileTransferState> {
  public update(state: RecursivePartial<FileTransferState>): void {
    const current = this.get();
    const next: FileTransferState = { ...current };

    for (const key in state) {
      if (!state.hasOwnProperty(key)) continue;

      const currentValue = current[key as keyof FileTransferState];
      const newValue = state[key as keyof FileTransferState];

      switch (true) {
        case isArray(currentValue) && isArray(newValue):
          (next as any)[key] = newValue;
          break;
        case isObject(currentValue) && isObject(newValue):
          (next as any)[key] = { ...currentValue, ...newValue };
          break;
        default:
          (next as any)[key] = newValue;
      }
    }

    this.set(next);
  }

  public add(newFiles: FileTransferState): void {
    if (newFiles.files.length === 0) {
      return;
    }

    const filesWithoutBytes = newFiles.files.map((file) => ({
      ...file,
      metadata: {
        ...file.metadata,
        bytes: undefined
      }
    }));

    this.update({
      files: this.get().files.concat(filesWithoutBytes)
    });

    for (const file of newFiles.files) {
      if (file.metadata.bytes) {
        fileBytesStore.set(file.id, file.metadata.bytes);
      }
    }
  }

  public remove(removeFiles: FileTransferState): void {
    if (removeFiles.files.length === 0) {
      return;
    }

    const remove = new Set(removeFiles.files.map((f) => f.id));
    console.log(this.get().files.filter((f) => !remove.has(f.id)));
    this.update({
      files: this.get().files.filter((f) => !remove.has(f.id))
    });

    for (const id in remove) {
      fileBytesStore.delete(id);
    }
  }
}
