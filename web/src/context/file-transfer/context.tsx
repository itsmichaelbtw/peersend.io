import type { WithChildren } from "@/types/misc";
import type { InitialFileTransferContext, PeerSendFile } from "./types";

import { createContext, useMemo, useReducer } from "react";

import { fileTransferReducer } from "./reducer";
import { fatalNoop } from "@/utils/noop";
import { withDefinedContext } from "@/hooks/use-context";

const INITIAL_STATE: InitialFileTransferContext = {
  files: [],
  getIncomingFiles: fatalNoop as any,
  getOutgoingFiles: fatalNoop as any,
  fileTransferDispatch: fatalNoop
};

export const FileTransferContext = createContext<InitialFileTransferContext>(INITIAL_STATE);
export const FileTransferConsumer = FileTransferContext.Consumer;

export function FileTransferProvider({ children }: WithChildren) {
  const [state, dispatch] = useReducer(fileTransferReducer, INITIAL_STATE);

  const fileGroups = useMemo(() => {
    return {
      incoming: state.files.filter(
        (f): f is PeerSendFile<"incoming"> => f.transferType === "incoming"
      ),
      outgoing: state.files.filter(
        (f): f is PeerSendFile<"outgoing"> => f.transferType === "outgoing"
      )
    };
  }, [state.files]);

  return (
    <FileTransferContext.Provider
      value={{
        ...state,
        getIncomingFiles() {
          return fileGroups.incoming;
        },
        getOutgoingFiles() {
          return fileGroups.outgoing;
        },
        fileTransferDispatch: dispatch
      }}
    >
      {children}
    </FileTransferContext.Provider>
  );
}

export function useFileTransferContext() {
  return withDefinedContext(FileTransferContext, "useFileTransferContext");
}
