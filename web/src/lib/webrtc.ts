import { deliverPayload, state } from "./websocket";
import { reactive } from "vue";

const rtcConfiguration: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
};

let peerConnection: RTCPeerConnection | null = null;
let dataChannel: RTCDataChannel | null = null;

export const rtcState = reactive({
  isConnected: false
});

export async function initialiseDirectConnection(): Promise<void> {
  if (!state.is_host) {
    console.error("Only the host can initiate a direct connection");
    return;
  }

  peerConnection = new RTCPeerConnection(rtcConfiguration);

  dataChannel = peerConnection.createDataChannel("messageChannel");

  setupDataChannel(dataChannel);
  setupPeerConnectionEvents(peerConnection);

  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    if (!peerConnection.localDescription) {
      throw new Error("Local description is null");
    }

    // convert these to enums
    deliverPayload("signal", {
      type: "webrtc_offer",
      offer: peerConnection.localDescription?.toJSON()
    });

    console.log("WebRTC offer created and sent");
  } catch (error) {
    console.error("Error creating WebRTC offer:", error);
  }
}

export async function handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
  if (state.is_host) {
    console.error("Host should not receive WebRTC offers");
    return;
  }

  console.log("Received WebRTC offer:", offer);

  peerConnection = new RTCPeerConnection(rtcConfiguration);

  setupPeerConnectionEvents(peerConnection);

  peerConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    setupDataChannel(dataChannel);
  };

  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    deliverPayload("signal", {
      type: "webrtc_answer",
      answer: peerConnection.localDescription
    });

    console.log("WebRTC answer created and sent");
  } catch (error) {
    console.error("Error handling WebRTC offer:", error);
  }
}

export async function handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
  if (!state.is_host || !peerConnection) {
    console.error("Cannot handle answer: not host or no connection");
    return;
  }

  console.log("Received WebRTC answer:", answer);

  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("Remote description set successfully");
  } catch (error) {
    console.error("Error handling WebRTC answer:", error);
  }
}

export function handleIceCandidate(candidate: RTCIceCandidateInit): void {
  if (!peerConnection) {
    console.error("Cannot handle ICE candidate: no connection");
    return;
  }

  console.log("Received ICE candidate:", candidate);

  try {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
}

function setupPeerConnectionEvents(pc: RTCPeerConnection): void {
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      deliverPayload("signal", {
        type: "webrtc_ice_candidate",
        candidate: event.candidate
      });
    }
  };

  pc.onconnectionstatechange = () => {
    console.log("Connection state:", pc.connectionState);

    // Update the connection state
    if (pc.connectionState === "connected") {
      rtcState.isConnected = true;
    } else if (
      pc.connectionState === "disconnected" ||
      pc.connectionState === "failed" ||
      pc.connectionState === "closed"
    ) {
      rtcState.isConnected = false;
    }
  };

  pc.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", pc.iceConnectionState);
  };
}

function setupDataChannel(channel: RTCDataChannel): void {
  channel.onopen = () => {
    console.log("Data channel opened");
    rtcState.isConnected = true;
  };

  channel.onclose = () => {
    console.log("Data channel closed");
    rtcState.isConnected = false;
  };

  channel.onmessage = (event) => {
    console.log("Received message:", event.data);
  };

  channel.onerror = (error) => {
    console.error("Data channel error:", error);
  };
}

// Add a function to send a message over the data channel
export function sendMessage(message: string = "Hi, I have connected"): void {
  if (!dataChannel || dataChannel.readyState !== "open") {
    console.error("Cannot send message: data channel not open");
    return;
  }

  dataChannel.send(message);
  console.log("Message sent:", message);
}

export function isRtcConnected(): boolean {
  return rtcState.isConnected;
}

export function closeRtcConnection(): void {
  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  rtcState.isConnected = false;
  console.log("WebRTC connection closed");
}
