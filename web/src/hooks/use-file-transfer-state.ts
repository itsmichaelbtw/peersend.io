import { useSyncExternalStore, useMemo } from "react";
import { fileTransferState, getIncomingFiles, getOutgoingFiles } from "@/state";

export function useFileTransferState() {
  const state = useSyncExternalStore(
    fileTransferState.subscribe.bind(fileTransferState),
    fileTransferState.get.bind(fileTransferState),
    () => fileTransferState.get()
  );

  const fileGroups = useMemo(() => {
    return {
      incoming: getIncomingFiles(),
      outgoing: getOutgoingFiles()
    };
  }, [state.files]);

  return {
    ...state,
    fileGroups: fileGroups
  };
}
