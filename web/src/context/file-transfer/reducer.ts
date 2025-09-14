import type { FileTransferInterface, FileTransferReducerActions } from "./types";

import { withDispatchReducer } from "../context.dispatch";

export function fileTransferReducer(
  state: FileTransferInterface,
  action: FileTransferReducerActions
): FileTransferInterface {
  const dispatch = withDispatchReducer(state, action);

  return dispatch(() => {
    switch (action.type) {
      case "ADD_FILES": {
        // something with duplicate files

        return {
          files: state.files.concat(action.payload.files ?? [])
        };
      }

      case "REMOVE_FILES": {
        if (action.payload.files.length === 0) {
          return {
            files: []
          };
        }

        return {
          files: state.files.filter((f) => !action.payload.files.includes(f))
        };
      }
    }

    return state;
  });
}
