import type { WebSocketEventMap, WebSocketMessages } from "./types";
import type { NetworkEvents } from "../types";

import { appState } from "@/state";

import { webrtcClient, CustomRTCPeerConnection } from "../webrtc";
import { webSocketClient } from "./client";

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
};

function event_session_information(data: WebSocketEventMap.IncomingEvents["session_information"]) {
  appState.dispatch("SET_SESSION_INFORMATION", data);
  webSocketClient.start_latency_monitoring();
}

function event_pong(data: WebSocketEventMap.IncomingEvents["pong"]) {
  webSocketClient.latency_checker.pong(data);
}

function event_sync_online_clients(data: WebSocketEventMap.IncomingEvents["sync_online_clients"]) {
  const { sessionState } = appState.get();

  if (sessionState.clients.length > data.clients.length) {
    webrtcClient.disconnect();
  }

  appState.dispatch("SET_CLIENTS", data);
}

function event_host_transferred(data: WebSocketEventMap.IncomingEvents["host_transferred"]) {
  appState.dispatch("SET_HOST", data);
}

async function event_webrtc_offer(data: WebSocketEventMap.IncomingEvents["webrtc_offer"]) {
  const { sessionState } = appState.get();

  if (sessionState.isHost) {
    webrtcClient.disconnect();
    webSocketClient.emit({
      type: "webrtc_reject",
      data: {
        reason: "Host cannot receive a WebRTC offer"
      }
    });

    return;
  }

  try {
    const pc = new CustomRTCPeerConnection(RTC_CONFIGURATION);

    appState.dispatch("UPDATE", {
      webrtcState: {
        peerConnection: pc
      }
    });

    const description = new RTCSessionDescription(data.description);
    await pc.setRemoteDescription(description);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (!pc.remoteDescription || !pc.localDescription) {
      throw new Error("Failed");
    }

    webSocketClient.emit({
      type: "webrtc_accept",
      data: {
        description: pc.localDescription.toJSON()
      }
    });
  } catch (error) {
    webSocketClient.disconnect();
    webSocketClient.emit({
      type: "webrtc_reject",
      data: {
        reason: error instanceof Error ? error.message : "Failed to handle remote offer"
      }
    });
  }
}

async function event_webrtc_accept(data: WebSocketEventMap.IncomingEvents["webrtc_accept"]) {
  const { sessionState, webrtcState } = appState.get();

  if (!sessionState.isHost) {
    webrtcClient.disconnect();
    webSocketClient.emit({
      type: "webrtc_reject",
      data: {
        reason: "A host must accept a WebRTC offer"
      }
    });
    return;
  }

  if (!webrtcState.peerConnection) {
    webrtcClient.disconnect();
    webSocketClient.emit({
      type: "webrtc_reject",
      data: {
        reason: "The host connection is faulty"
      }
    });
    return;
  }

  try {
    const description = new RTCSessionDescription(data.description);
    await webrtcState.peerConnection.setRemoteDescription(description);
  } catch (error) {
    webrtcClient.disconnect();
    webSocketClient.emit({
      type: "webrtc_reject",
      data: {
        reason: "Failed to establish a direct connection"
      }
    });
  }
}

async function event_webrtc_ice_candidate(
  data: WebSocketEventMap.IncomingEvents["webrtc_ice_candidate"]
) {
  const { webrtcState } = appState.get();

  if (!webrtcState.peerConnection) {
    webrtcClient.disconnect();
    webSocketClient.emit({
      type: "webrtc_reject",
      data: {
        reason: "Direction connection is faulty"
      }
    });
    // need to maybe add error messages here for the client
    return;
  }

  try {
    const candidate = new RTCIceCandidate(data.candidate);
    await webrtcState.peerConnection.addIceCandidate(candidate);
  } catch (error) {
    webrtcClient.disconnect();
    webSocketClient.emit({
      type: "webrtc_reject",
      data: {
        reason: "Failed to establish a direct connection"
      }
    });
  }
}

function event_webrtc_reject(data: WebSocketEventMap.IncomingEvents["webrtc_reject"]) {
  webSocketClient.disconnect();

  appState.dispatch("SET_LAST_ERROR", {
    title: "Direct Connection Failed",
    message: data.reason
  });
}

function event_error(data: WebSocketEventMap.IncomingEvents["error"]) {
  appState.dispatch("SET_LAST_ERROR", {
    title: data.type,
    message: data.reason
  });
}

export const events: NetworkEvents<WebSocketMessages.IncomingMessage> = {
  session_information: event_session_information,
  sync_online_clients: event_sync_online_clients,
  pong: event_pong,
  host_transferred: event_host_transferred,
  webrtc_accept: event_webrtc_accept,
  webrtc_reject: event_webrtc_reject,
  webrtc_offer: event_webrtc_offer,
  webrtc_ice_candidate: event_webrtc_ice_candidate,
  error: event_error
};
