import type { WithNullable } from "./misc";
import type { ConnectionState } from "./connection";

export type IncomingWebRTCMessageType = "";

export interface WebRTCConnectionState extends ConnectionState {
  dataChannel: WithNullable<RTCDataChannel>;
  peerConnection: WithNullable<RTCPeerConnection>;
}
