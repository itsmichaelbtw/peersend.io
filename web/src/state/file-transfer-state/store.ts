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
		if (files.length === 0) {
			return;
		}

		this.dispatch("BULK_REMOVE_FILES", files);

		for (const file of files) {
			fileStorage.remove(file.id);
		}
	}

	protected reducer(
		state: FileTransferState,
		action: ContextReducerActions<StateActions, FileTransferState>
	): Partial<FileTransferState> {
		switch (action.type) {
			case "BULK_ADD_FILES": {
				return {
					files: state.files.concat(action.payload)
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
				return {
					files: state.files.filter((f) => !action.payload.includes(f))
				};
			}

			case "BULK_SET_FILES": {
				return {
					files: action.payload
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
								status: action.payload.status
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
