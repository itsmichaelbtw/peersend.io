import type { RecursivePartial } from "@/types/misc";
import type { ContextReducerActions } from "@/context/context.types";
import type { AppState, ConnectionErrorData } from "../types";
import type { WebSocketEventMapIncomingEvents } from "@/lib/networking";

import { StateStore } from "../store";
import { isObject } from "@/utils/is-x";

interface StateActions {
	UPDATE: RecursivePartial<AppState>;
	SET_LAST_ERROR: ConnectionErrorData | null;
	SET_SESSION_INFORMATION: WebSocketEventMapIncomingEvents["session_information"];
	SET_CLIENTS: WebSocketEventMapIncomingEvents["sync_clients"];
	SET_HOST: WebSocketEventMapIncomingEvents["host_transferred"];
	RESET_CONNECTING_STATES: null;
}

export class AppStateStore extends StateStore<AppState, StateActions> {
	private update(state: RecursivePartial<AppState>): AppState {
		const current = this.get();
		const next: AppState = { ...current };

		for (const key in next) {
			if (Object.prototype.hasOwnProperty.call(state, key)) {
				// @ts-expect-error Known state shape
				if (isObject(current[key]) && isObject(state[key])) {
					// @ts-expect-error Known state shape
					next[key] = { ...current[key], ...state[key] };
				} else {
					// @ts-expect-error Known state shape
					next[key] = state[key] as unknown;
				}
			}
		}

		return next;
	}

	protected reducer(
		state: AppState,
		action: ContextReducerActions<StateActions, AppState>
	): Partial<AppState> {
		switch (action.type) {
			case "UPDATE": {
				return this.update(action.payload);
			}

			case "SET_SESSION_INFORMATION": {
				return this.update({
					sessionState: {
						isConnected: true,
						clientId: action.payload.client_id,
						clients: action.payload.clients,
						isHost: action.payload.host_id === action.payload.client_id,
						maximumClients: action.payload.maximum_clients,
						fileTransferCapacity: action.payload.file_transfer_capacity,
						sessionCode: action.payload.session_code,
						autoWebRTC: action.payload.auto_webrtc,
						encryptionMode: action.payload.encryption_mode,
						connectionType: action.payload.connection_type,
						lastError: null
					},
					websocketState: {
						isConnected: true,
						isConnecting: false
					},
					webrtcState: {
						isConnected: false,
						isConnecting: false
					}
				});
			}

			case "SET_CLIENTS": {
				return this.update({
					sessionState: {
						clients: action.payload.clients
					}
				});
			}

			case "SET_HOST": {
				return this.update({
					sessionState: {
						isHost: action.payload.host_id === state.sessionState.clientId
					}
				});
			}

			case "SET_LAST_ERROR": {
				return this.update({
					sessionState: {
						lastError: action.payload
					},
					websocketState: {
						isConnecting: false
					},
					webrtcState: {
						isConnecting: false
					}
				});
			}

			case "RESET_CONNECTING_STATES": {
				return this.update({
					websocketState: {
						isConnecting: false
					},
					webrtcState: {
						isConnecting: false
					}
				});
			}
		}

		return state;
	}
}
