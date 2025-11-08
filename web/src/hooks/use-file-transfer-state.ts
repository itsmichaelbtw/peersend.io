import type { PeerSendFile } from "@/state";

import { useSyncExternalStore, useMemo } from "react";
import { fileTransferState } from "@/state";

export function useFileTransferState() {
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
				(f): f is PeerSendFile<"incoming"> => f.transfer.type === "outgoing"
			)
		};
	}, [state.files]);

	return {
		...state,
		fileGroups: fileGroups
	};
}
