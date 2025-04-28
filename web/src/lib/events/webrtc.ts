import type { IncomingTransmissionData } from "@/types/state";

import { applicationState, flagApplicationError, rtcState } from "@/state/application";
import { WebSocketClient } from "../websocket";
import { WebRTCClient } from "../webrtc";
import { WebRTCLatencyChecker } from "../latency/webrtc";

export abstract class PeerConnectionEvents {
  public static onICECandidate(this: RTCPeerConnection, event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      WebSocketClient.emit("webrtc_ice_candidate", {
        candidate: event.candidate.toJSON()
      });
    }
  }

  public static onICEConnectionStateChange(this: RTCPeerConnection, event: Event) {
    if (!rtcState.peerConnection) {
      return;
    }

    // if (rtcState.peerConnection.connectionState === "disconnected") {
    // }
  }

  public static onConnectionStateChange(this: RTCPeerConnection, event: Event) {
    if (!rtcState.peerConnection) {
      return;
    }

    switch (rtcState.peerConnection.connectionState) {
      case "connected":
        rtcState.is_connected = true;
        rtcState.is_connecting = false;
        applicationState.connection_type = "webrtc";

        WebSocketClient.stopLatencyMonitoring();
        WebRTCClient.setupLatencyChecker(new WebRTCLatencyChecker());

        break;
      case "disconnected":
      case "failed":
      case "closed":
        WebRTCClient.disconnect();
    }
  }

  public static onDataChannel(this: RTCPeerConnection, event: RTCDataChannelEvent) {
    const channel = event.channel;

    rtcState.dataChannel = channel;

    channel.onopen = DataChannelEvents.onOpen;
    channel.onclose = DataChannelEvents.onClose;
    channel.onerror = DataChannelEvents.onError;
    channel.onmessage = DataChannelEvents.onMessage;
  }
}

export abstract class DataChannelEvents {
  public static onOpen(this: RTCDataChannel, _: Event) {
    if (!applicationState.is_host) {
      WebRTCClient.latencyChecker = new WebRTCLatencyChecker();
    }
  }

  public static onClose(this: RTCDataChannel, _: Event) {
    // rtcState.is_connected = false;
    // rtcState.is_connecting = false;
  }

  public static onError(this: RTCDataChannel, event: RTCErrorEvent) {
    if (event.error) {
      // flagApplicationError(event.)
    }
  }

  public static onMessage(this: RTCDataChannel, event: MessageEvent) {
    try {
      const payload = JSON.parse(event.data) as IncomingTransmissionData<any>;

      switch (payload.type) {
        case "ping": {
          WebRTCClient.emit("pong", {
            client_timestamp: payload.data.client_timestamp,
            server_timestamp: Date.now()
          });

          break;
        }

        case "pong": {
          if (WebRTCClient.latencyChecker) {
            WebRTCClient.latencyChecker.pong(payload.data);
          }

          break;
        }
      }
    } catch (error) {
      console.log(error);
      WebSocketClient.emit("error", {
        message: "WebRTC failed to parse outgoing payload"
      });
    }
  }
}
