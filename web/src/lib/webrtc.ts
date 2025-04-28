import type { WithNullable } from "@/types/misc";

import {
  applicationState,
  rtcState,
  flagApplicationError,
  DEFAULT_WEBRTC_STATE
} from "@/state/application";
import { LatencyMonitor } from "./latency/monitor";
import { WebSocketClient } from "./websocket";
import { PeerConnectionEvents } from "./events/webrtc";

import { sleep } from "@/utils/sleep";

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
};

function attachListeners(connection: RTCPeerConnection) {
  connection.onicecandidate = PeerConnectionEvents.onICECandidate;
  connection.oniceconnectionstatechange = PeerConnectionEvents.onICEConnectionStateChange;
  connection.onconnectionstatechange = PeerConnectionEvents.onConnectionStateChange;
  connection.ondatachannel = PeerConnectionEvents.onDataChannel;
}

export abstract class WebRTCClient extends LatencyMonitor {
  public static emit(type: string, data: Record<string, any>) {
    if (!rtcState.dataChannel || !rtcState.is_connected) {
      return;
    }

    if (rtcState.dataChannel.readyState === "open") {
      rtcState.dataChannel!.send(
        JSON.stringify({
          type: type,
          data: data
        })
      );
    }
  }

  public static async handleICECandidate(candidate: RTCIceCandidate) {
    if (!rtcState.peerConnection) {
      WebRTCClient.disconnect();
      WebSocketClient.emit("webrtc_reject", {
        reason: "Peer connection faulty"
      });

      return flagApplicationError("WebRTC connection is faulty");
    }

    try {
      await rtcState.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error: any) {
      WebRTCClient.disconnect();
      WebSocketClient.emit("webrtc_reject", {});

      flagApplicationError(error?.message || "Invalid ICE candidate received");
    }
  }

  public static async handleOffer(offer: RTCSessionDescriptionInit) {
    if (applicationState.is_host) {
      WebRTCClient.disconnect();
      WebSocketClient.emit("webrtc_reject", {
        reason: "Host somehow received a WebRTC offer"
      });

      return flagApplicationError("Host should not receive WebRTC offers");
    }

    let peerConnection: WithNullable<RTCPeerConnection> = null;

    try {
      peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
      attachListeners(peerConnection);

      rtcState.peerConnection = peerConnection;

      const description = new RTCSessionDescription(offer);
      await peerConnection.setRemoteDescription(description);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (!peerConnection.remoteDescription || !peerConnection.localDescription) {
        throw new Error("Offer was received but quickly rejected");
      }

      WebSocketClient.emit("webrtc_accept", {
        description: peerConnection.localDescription!.toJSON()
      });
    } catch (error: any) {
      WebRTCClient.disconnect();
      WebSocketClient.emit("webrtc_reject", {});

      flagApplicationError(error?.message || "Incoming WebRTC connection failed to accept offer");
    }
  }

  public static async acceptOffer(answer: RTCSessionDescriptionInit) {
    if (!applicationState.is_host) {
      WebRTCClient.disconnect();
      WebSocketClient.emit("webrtc_reject", {
        reason: "Host connection faulty"
      });

      return flagApplicationError("Only the host can accept a WebRTC answer");
    }

    if (!rtcState.peerConnection) {
      WebRTCClient.disconnect();
      WebSocketClient.emit("webrtc_reject", {
        reason: "Host connection faulty"
      });

      return flagApplicationError("Missing host peer connection");
    }

    try {
      const description = new RTCSessionDescription(answer);
      await rtcState.peerConnection.setRemoteDescription(description);
    } catch (error: any) {
      WebRTCClient.disconnect();
      WebSocketClient.emit("webrtc_reject", {});

      flagApplicationError(error?.message || "Failed to set remote description");
    }
  }

  public static declineOffer(reason?: string) {
    WebRTCClient.disconnect();

    flagApplicationError(reason || "Connection refused between other peer");
  }

  public static async connect() {
    if (!applicationState.is_host) {
      flagApplicationError("Only a host can initiate a direct connection");
      return;
    }

    rtcState.is_connecting = true;

    let peerConnection: WithNullable<RTCPeerConnection> = null;

    try {
      peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
      attachListeners(peerConnection);

      await sleep(500);

      const dataChannel = peerConnection.createDataChannel("peersend.io/rtc");

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (!peerConnection.localDescription) {
        throw new Error("Local description is null. Cannot offer connection");
      }

      rtcState.dataChannel = dataChannel;
      rtcState.peerConnection = peerConnection;

      PeerConnectionEvents.onDataChannel.call(peerConnection, {
        channel: dataChannel
      } as any);

      WebSocketClient.emit("webrtc_offer", {
        description: peerConnection.localDescription!.toJSON()
      });
    } catch (error: any) {
      WebRTCClient.disconnect();

      flagApplicationError(error?.message || "Unable to offer a WebRTC connection");
    }
  }

  public static disconnect() {
    if (rtcState.dataChannel) {
      rtcState.dataChannel.close();
    }

    if (rtcState.peerConnection) {
      rtcState.peerConnection.close();
    }

    WebRTCClient.stopLatencyMonitoring();
    WebRTCClient.reset();

    // when disconnecting from RTC, we want to reset
    // the latency check back to the WebSocketClient
    WebSocketClient.startLatencyMonitoring();

    flagApplicationError("Direct connection has been lost");
  }

  public static reset() {
    Object.assign(rtcState, structuredClone(DEFAULT_WEBRTC_STATE));

    applicationState.connection_type = "websocket";
    applicationState.latency = -1;
  }
}
