import type { FileTransferState, PeerSendFile } from "@/state";

import { useSyncExternalStore, useMemo } from "react";
import { fileTransferState } from "@/state";

interface FileGroups {
	incoming: PeerSendFile<"incoming">[];
	outgoing: PeerSendFile<"outgoing">[];
}

interface UseFileTransferState extends FileTransferState {
	fileGroups: FileGroups;
}

export function useFileTransferState(): UseFileTransferState {
	const state = useSyncExternalStore(
		fileTransferState.subscribe.bind(fileTransferState),
		fileTransferState.get.bind(fileTransferState),
		() => fileTransferState.get()
	);

	const fileGroups = useMemo(() => {
		return {
			incoming: state.files.filter(
				(f): f is PeerSendFile<"incoming"> => f.transfer.type === "incoming"
			),
			outgoing: state.files.filter(
				(f): f is PeerSendFile<"outgoing"> => f.transfer.type === "outgoing"
			)
		} as FileGroups;
	}, [state.files]);

	return {
		...state,
		fileGroups: fileGroups
	};
}
