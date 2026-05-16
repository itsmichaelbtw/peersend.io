import type { ContextReducerActions } from "@/context/context.types";
import type { RequiredKeys } from "@/types/misc";
import type { FileTransferState, PeerSendFile } from "../types";

import { StateStore } from "../store";
import { fileStorage } from "@/lib/file-transfer";

type ID = Pick<PeerSendFile, "id">;

interface StateActions {
	BULK_ADD_FILES: PeerSendFile[];
	BULK_REMOVE_FILES: RequiredKeys<PeerSendFile, "id">[];
	BULK_UPDATE_FILES: PeerSendFile[];
	BULK_SET_FILES: PeerSendFile[];
	SET_FILE_PERCENTAGE: ID & {
		percentage: PeerSendFile["transfer"]["percentage"];
	};
	SET_FILE_STATUS: ID & {
		status: PeerSendFile["status"];
		errorMessage?: string;
	};
}

export class FileTransferStore extends StateStore<FileTransferState, StateActions> {
	public add(files: StateActions["BULK_ADD_FILES"]): void {
		if (files.length === 0) {
			return;
		}

		this.dispatch("BULK_ADD_FILES", files);
	}

	public remove(files: StateActions["BULK_REMOVE_FILES"]): void {
		const safeFiles = files.filter((f) => f.status !== "in-transit");

		if (safeFiles.length === 0) {
			return;
		}

		this.dispatch("BULK_REMOVE_FILES", safeFiles);
	}

	protected reducer(
		state: FileTransferState,
		action: ContextReducerActions<StateActions, FileTransferState>
	): Partial<FileTransferState> {
		switch (action.type) {
			case "BULK_ADD_FILES": {
				const newIds = new Set(state.fileIds);
				for (const f of action.payload) newIds.add(f.id);
				return {
					files: state.files.concat(action.payload),
					fileIds: newIds
				};
			}

			case "BULK_UPDATE_FILES": {
				return {
					files: state.files.map((file) => {
						const newFile = action.payload.find((f) => f.id === file.id);

						return newFile ? newFile : file;
					})
				};
			}

			case "BULK_REMOVE_FILES": {
				const removedIds = new Set(action.payload.map((f) => f.id));
				const newIds = new Set(state.fileIds);
				for (const id of removedIds) {
					newIds.delete(id);
					fileStorage.remove(id);
				}
				return {
					files: state.files.filter((f) => !action.payload.includes(f)),
					fileIds: newIds
				};
			}

			case "BULK_SET_FILES": {
				return {
					files: action.payload,
					fileIds: new Set(action.payload.map((f) => f.id))
				};
			}

			case "SET_FILE_PERCENTAGE": {
				if (action.payload.percentage < 0) {
					return state;
				}

				return {
					files: state.files.map((file) => {
						if (file.id === action.payload.id) {
							return {
								...file,
								transfer: {
									...file.transfer,
									percentage: action.payload.percentage
								}
							};
						}

						return file;
					})
				};
			}

			case "SET_FILE_STATUS": {
				return {
					files: state.files.map((file) => {
						if (file.id === action.payload.id) {
							return {
								...file,
								status: action.payload.status,
								errorMessage: action.payload.errorMessage
							};
						}

						return file;
					})
				};
			}
		}

		return state;
	}
}
