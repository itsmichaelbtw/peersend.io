import { useSyncExternalStore, useMemo } from "react";
import { fileTransferState, getIncomingFiles, getOutgoingFiles } from "@/state";

export function useFileTransferState() {
	const state = useSyncExternalStore(
		fileTransferState.subscribe.bind(fileTransferState),
		fileTransferState.get.bind(fileTransferState),
		() => fileTransferState.get()
	);

	// weird one
	const fileGroups = useMemo(() => {
		return {
			incoming: getIncomingFiles(),
			outgoing: getOutgoingFiles()
		};
	}, []);

	return {
		...state,
		fileGroups: fileGroups
	};
}
